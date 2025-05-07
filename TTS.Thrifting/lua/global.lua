-- Global Script

--[[
    Generic functions useful to any lua code.
    Note these are not local so other files can use them.
]]
function GetMapKeys(map)
    local keys = {}
    for key, _ in pairs(map) do
        table.insert(keys, key)
    end
    return keys
end

-- DebugLog shite.
local debugFlags = {
    cardMarking = false,
    cardUI = false,
    game = false,
    heartbeat = false,
    markerUI = false,
    network = false,
    originalDecal = true,
    ui = false,
}

function myPrintToAll(...)
    local args = { ... }
    local msg = ""

    for i, v in ipairs(args) do
        msg = msg .. tostring(v)
        if i < #args then
            msg = msg .. " "
        end
    end

    printToAll(msg, "Green") -- Goes to TTS log.txt and console (~)
end

-- Debug log function
function Dlog(flag, ...)
    if debugFlags[flag] then
        myPrintToAll(string.format("[DEBUG:%s]", flag), ...)
    end
end

function Ddump(flag, message, object)
    if not debugFlags[flag] then return end

    myPrintToAll(message)

    local function dump(obj, indent, visited)
        indent = indent or ""
        visited = visited or {}

        if type(obj) ~= "table" then
            myPrintToAll(indent .. tostring(obj))
            return
        end

        if visited[obj] then
            myPrintToAll(indent .. "*recursive reference*")
            return
        end
        visited[obj] = true

        for k, v in pairs(obj) do
            local keyStr = tostring(k)
            if keyStr then
                myPrintToAll(indent .. "[" .. keyStr .. "] = ")
            end

            if type(v) == "table" then
                myPrintToAll("{")
                dump(v, indent .. "  ", visited)
                myPrintToAll(indent .. "}")
            else
                myPrintToAll(tostring(v))
            end
        end
    end

    dump(object)
end

-- Track the number of cards in each player's hand
-- Maps player color to hand size.
local playerHandSizes = {}

local ItemDeckGUID = "722737"

local cardMarkingsByName = {}
local nextCardId = 0

local secBetweenLoops = 0.5

local buttonPanelHeight = 40
local buttonPanelWidth = 350
local buttonPanelOffsetFromBottom = 105
local buttonPanelContainerHeight = buttonPanelHeight + buttonPanelOffsetFromBottom


--[[
Local functions to help with player management: who's seated, who has what in their hand, etc.
]]
local allPlayerColors = {
    "White",
    "Brown",
    "Red",
    "Orange",
    "Yellow",
    "Green",
    "Teal",
    "Blue",
    "Purple",
    "Pink",
}


local xmlMarkerUIFormatString = [[
  <Panel id="bottomButtons" active="%s" rectAlignment="LowerCenter" width="%d" height="%d" visibility="%s">
    <HorizontalLayout spacing="20" padding="0 0 0 %d" childAlignment="UpperCenter">
      <Button onClick="SetPriceUnknown" fontSize="24">
        <Text>???</Text>
      </Button>
      <Button onClick="SetPrice1" fontSize="24">
        <Text>$</Text>
      </Button>
      <Button onClick="SetPrice2" fontSize="24">
        <Text>$$</Text>
      </Button>
      <Button onClick="SetPrice3" fontSize="24">
        <Text>$$$</Text>
      </Button>
      <Button onClick="ToggleHalfPrice" fontSize="24">
        <Text>1/2</Text>
      </Button>
      <Button onClick="ToggleTorn" fontSize="24">
        <Text>Torn</Text>
      </Button>
    </HorizontalLayout>
</Panel>
]]

-- A map from player color to "true": if player is in may they can see the card marking UI.
local playerColorsToViewingMarkerUIMap = {
}

-- Get a list of all seated players in the game.
local function getSeatedPlayers()
    Dlog("heartbeat", "getSeatedPlayers")
    local players = Player.getPlayers()
    local seatedPlayers = {}

    for _, player in ipairs(players) do
        if player.seated and player.color and player.color ~= "Grey" then
            Dlog("heartbeat", "getSeatedPlayers this player is seated: " .. player.color)
            table.insert(seatedPlayers, player)
        end
    end

    return seatedPlayers
end

-- Is this the color of a seated player?
local function getIsSeatedPlayer(playerColor)
    local seatedPlayers = getSeatedPlayers()
    for _, player in ipairs(seatedPlayers) do
        if player.color == playerColor then
            return true
        end
    end
    return false
end

-- Current check, how many ItemCards in player hand?
local function getPlayerItemCardCount(seatedPlayer)
    Dlog("heartbeat", "getPlayerItemCardCount 001")
    if not seatedPlayer then
        return 0
    end

    local objects = seatedPlayer.getHandObjects()
    -- Count the objects that have the proper "item card" tag.
    local itemCardCount = 0
    for _, obj in ipairs(objects) do
        if obj.hasTag("ItemCard") then
            itemCardCount = itemCardCount + 1
        end
    end
    return itemCardCount
end

-- Iff this player has exactly one card in hand, return that, else nil.
local function getPlayersSingleCard(seatedPlayer)
    if not seatedPlayer then
        return nil
    end

    local zone = seatedPlayer.getHandTransform()
    local objects = seatedPlayer.getHandObjects()
    -- Count the objects that have the proper "item card" tag.
    local singleItemCard = nil

    for _, obj in ipairs(objects) do
        if obj.hasTag("ItemCard") then
            if singleItemCard == nil then
                singleItemCard = obj
            else
                -- More than one item card, so return nil.
                return nil
            end
        end
    end
    return singleItemCard
end


-- Refresh the UI: specifically who can see it.
local refreshMarkerUICallCount = 0
local function refreshMarkerUI()
    refreshMarkerUICallCount = refreshMarkerUICallCount + 1
    Dlog("markerUI", "refreshMarkerUICallCount: " .. refreshMarkerUICallCount)
    Dlog("markerUI", "refreshMarkerUI")

    local isActiveString = "true"
    -- Get an array of players who can see the UI: this is the keys of playerColorsToViewingMarkerUIMap map.
    local playersColorsWhoCanSeeUI = GetMapKeys(playerColorsToViewingMarkerUIMap)
    -- Turn that into a space-separated string.
    local playersString = table.concat(playersColorsWhoCanSeeUI, "|")
    -- If this is empty set it to a dummy value.
    if playersString == "" then
        -- We want to set 'active' to 'false'
        isActiveString = "false"
    end

    Dlog("markerUI", "isActiveString: " .. isActiveString)
    Dlog("markerUI", "playersString: " .. playersString)

    -- Write that into the format string.
    local xml = string.format(xmlMarkerUIFormatString, isActiveString, buttonPanelWidth, buttonPanelContainerHeight,
        playersString,
        buttonPanelOffsetFromBottom)
    Dlog("markerUI", "xml: " .. xml)

    -- Set that as the global UI.
    UI.setXml(xml)
end

--[[
    Local functions called when we notice a change from not-1 item 1 item, or back.
]]
-- Show UI for a specific player (color: "Red", "Blue", etc.)
local function showMarkerUIForPlayer(playerColor)
    -- Add this player to list of parties who can see the UI.
    playerColorsToViewingMarkerUIMap[playerColor] = true
    -- Refresh the UI.
    refreshMarkerUI()
end

local function hideMarkerUIForPlayer(playerColor)
    -- Add this player to list of parties who can see the UI.
    playerColorsToViewingMarkerUIMap[playerColor] = nil
    -- Refresh the UI.
    refreshMarkerUI()
end

function onPlayerHasOnlyOneCard(playerColor)
    Dlog("markerUI", playerColor .. " now has exactly ONE card in hand!")
    -- Add your custom logic here
    showMarkerUIForPlayer(playerColor)
end

function onPlayerHasNotOneCard(playerColor)
    Dlog("markerUI", playerColor .. " now has MORE or LESS than one card in hand!")
    -- Add your custom logic here
    hideMarkerUIForPlayer(playerColor)
end

local topPriceZ = -1.1
local topPriceX = 0.7

local v1 = Vector(topPriceX, 0.36, topPriceZ)
local v2 = Vector(0, 0.36, topPriceZ)
local v3 = Vector(-topPriceX, 0.36, topPriceZ)

local pricePositions = {
    [1] = v1,
    [2] = v2,
    [3] = v3,
}

local priceRotations = {
    [1] = Vector(90, 180, 10),
    [2] = Vector(90, 180, 0),
    [3] = Vector(90, 180, -10),
}

local function updateCardUI(card)
    Dlog("cardUI", "updateCardUI")
    -- Get the card name and check if it is in the table.

    if card == nil then
        Dlog("cardUI", "updateCardUI 001")
        return
    end

    local markings = cardMarkingsByName[card.getName()]
    Ddump("cardUI", "markings = ", markings)
    local decals = {}
    if markings ~= nil and markings.price then
        -- Add a paper clip based on the price.
        local oldDecals = card.getDecals()
        Ddump("originalDecal", "oldDecals = ", oldDecals)

        local pricePosition = pricePositions[markings.price]
        local priceRotation = priceRotations[markings.price]
        Dlog("ui", "Adding decals")
        local decal = {
            name = "paperclip",
            url = "https://i.imgur.com/A1ljX7A.png",
            rotation = priceRotation,
            position = pricePosition,
            scale = Vector(1, 1, 15),
        }
        table.insert(decals, decal)
    end
    Ddump("cardUI", "decals = ", decals)
    -- Set the decals for card.
    card.setDecals(decals)
end

-- Called whenever something enters or leaves a player hand
function checkHandSizes()
    Dlog("heartbeat", "checkHandSizes")
    -- First, x out any players who are not seated.
    for _, playerColor in pairs(allPlayerColors) do
        if not getIsSeatedPlayer(playerColor) then
            playerHandSizes[playerColor] = nil
        end
    end

    -- Update the seated players.
    local seatedPlayers = getSeatedPlayers()
    for _, seatedPlayer in pairs(seatedPlayers) do
        local color = seatedPlayer.color
        local itemCardCount = getPlayerItemCardCount(seatedPlayer)
        local oldSize = playerHandSizes[color] or 0

        -- Look for cases where it changes to or from 1.
        if itemCardCount ~= oldSize then
            if oldSize ~= 1 and itemCardCount == 1 then
                onPlayerHasOnlyOneCard(color)
            elseif oldSize == 1 and itemCardCount ~= 1 then
                onPlayerHasNotOneCard(color)
            end
            playerHandSizes[color] = itemCardCount
        end
    end
end

local function loopStep()
    Dlog("heartbeat", "loopStep")
    -- Check the hand sizes of all players.
    checkHandSizes()
    -- Call this function again after a short delay.
    Wait.time(loopStep, secBetweenLoops)
end

local function startLoop()
    Dlog("heartbeat", "startLoop")
    loopStep();
end

local function setPriceInternal(player, price)
    Dlog("cardMarking", "setPriceInternal")
    Dlog("cardMarking", "price: " .. tostring(price))
    -- Get the card in the player's hand.  Should be exactly one.
    local singleItemCard = getPlayersSingleCard(player)
    if not singleItemCard then
        Dlog("cardMarking", "setPriceInternal 001")
        -- Odd: button should be disabled.  Maybe a timing issue.
        -- Handle gracefully.
        return
    end

    Dlog("cardMarking", "setPriceInternal 002")
    -- Set or change the markings on the card.
    -- Card better have a name.
    local cardName = singleItemCard.getName()
    assert(cardName ~= nil, "cardName is nil!")
    assert(cardName ~= "", "cardName is empty!")
    -- Get the markings for this card.
    local markings = cardMarkingsByName[cardName]
    if not markings then
        markings = {}
    end
    Ddump("cardMarking", "setPriceInternal markings = ", markings)
    markings.price = price
    cardMarkingsByName[cardName] = markings
    Ddump("cardMarking", "setPriceInternal cardMarkingsByName = ", cardMarkingsByName)

    -- Update the UI for the card.
    updateCardUI(singleItemCard)
end


--[[
    Non local functions.  Called as coroutines.
]]
-- Button click handlers.
-- Called from XML file.
function SetPriceUnknown(player, value, id)
    Dlog("cardMarking", "In SetPriceUnknown")
    setPriceInternal(player, null)
end

function SetPrice1(player, value, id)
    Dlog("cardMarking", "In SetPrice1")
    setPriceInternal(player, 1)
end

function SetPrice2(player, value, id)
    Dlog("cardMarking", "In SetPrice2")
    setPriceInternal(player, 2)
end

function SetPrice3(player, value, id)
    Dlog("cardMarking", "In SetPrice3")
    setPriceInternal(player, 3)
end

function ToggleHalfPrice(player, value, id)
end

function ToggleTorn(player, value, id)
end

--[[
    API LEVEL FUNCTIONS
]]
function onLoad()
    Dlog("ui", "onLoad started")
    startLoop()
end

-- Make sure that all the cards in the item deck are tagged as ItemCards.
-- Also give each card a unique ID that will persist when put back into
-- a deck (card GUID does not persist).
function onObjectLeaveContainer(container, object)
    if container.getGUID() == ItemDeckGUID then
        Dlog("ui", "Doug: tagging card.")
        -- This is an item card.
        object.addTag("ItemCard")
        -- Give it an ID, written into the name field, only if we didn't already do that.
        local name = object.getName()
        if name == "" or name == nil then
            nextCardId = nextCardId + 1
            object.setName("ItemCard" .. nextCardId)
        end
        -- Update the card UI based on the name.
        updateCardUI(object)
    end
end
