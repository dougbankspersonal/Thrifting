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
    cardFlips = true,
    cardMarking = false,
    cardTagging = true,
    cardUI = false,
    game = false,
    global = false,
    heartbeat = false,
    markerUI = false,
    network = false,
    ui = false,
}

local function myPrintToAll(...)
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

local secBetweenCheckHandSizes = 0.5
local secBetweenCheckCardFlips = 1.0

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

--[[
I absolutely hate TTS and the way it handles position w.r.t. objects.Global
The only way I know to get these values is to just experiment until it looks right.
X seems to move things right/left across the card, with positive X pushinng thing to the left.
Y seems to be about the thickness of the card.
  * If it's too low the decal doesn't show up.
  * If it's ridiculously high it doesn't seem to matter.
Z seems to be about up/down on the card. Positive Z pushes things down.
]]
local topOffsetX = 0.7
local offsetZ = 1.1
local cardThickness = 0.36
local bottomOffsetX = 0.6

-- Remember -Z moves things up the card.
local price1Position = Vector(topOffsetX, cardThickness, -offsetZ)
local price2Position = Vector(0, cardThickness, -offsetZ)
local price3Position = Vector(-topOffsetX, cardThickness, -offsetZ)

local halfPricePosition = Vector(bottomOffsetX, cardThickness, offsetZ)
local tornPosition = Vector(-bottomOffsetX, cardThickness, offsetZ)


local decalXRot = 90
local decalYRot = 180
local decalZRot = 0

local pricePositions = {
    [1] = price1Position,
    [2] = price2Position,
    [3] = price3Position,
}

local decalFrontRotation = Vector(decalXRot, decalYRot, decalZRot)
local decalBackRotation = Vector(decalXRot + 180, decalYRot, decalZRot)

-- Got these from experiments too.  Why 15?  No idea.
local decalScale = Vector(1, 1, 15)

local itemDeckTag = "ItemDeck"
local itemCardTag = "ItemCard"
local itemCardNamePrefix = "ItemCard_"

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
        if obj.hasTag(itemCardTag) then
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

    local objects = seatedPlayer.getHandObjects()
    -- Count the objects that have the proper "item card" tag.
    local singleItemCard = nil

    for _, obj in ipairs(objects) do
        if obj.hasTag(itemCardTag) then
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

local function getNameAndMarkingsForCard(itemCard)
    Dlog("cardMarking", "getNameAndMarkingsForCard")
    -- Card better have a name.
    local cardName = itemCard.getName()
    assert(cardName ~= nil, "cardName is nil!")
    assert(cardName ~= "", "cardName is empty!")
    -- Get the markings for this card.
    local markings = cardMarkingsByName[cardName]
    if not markings then
        markings = {}
    end
    return cardName, markings
end

local function enforceOrientation(itemCard, shouldBeFaceUp)
    Dlog("cardFlips", "enforceOritentation itemCard.Name = " .. itemCard.getName())
    Ddump("cardFlips", "enforceOritentation itemCard rotation = ", itemCard.getRotation())
end

local function getSingleItemCardWithNameAndMarkings(player)
    Dlog("cardMarking", "getSingleItemCardWithNameAndMarkings")
    -- Get the card in the player's hand.  Should be exactly one.
    local singleItemCard = getPlayersSingleCard(player)
    if not singleItemCard then
        Dlog("cardMarking", "getSingleItemCardWithNameAndMarkings 001")
        -- Odd: button should be disabled.  Maybe a timing issue.
        -- Handle gracefully.
        return nil, nil, nil
    end

    local cardName, markings = getNameAndMarkingsForCard(singleItemCard)
    return singleItemCard, cardName, markings
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

local function onPlayerHasOnlyOneCard(playerColor)
    Dlog("markerUI", playerColor .. " now has exactly ONE card in hand!")
    -- Add your custom logic here
    showMarkerUIForPlayer(playerColor)
end

local function onPlayerHasNotOneCard(playerColor)
    Dlog("markerUI", playerColor .. " now has MORE or LESS than one card in hand!")
    -- Add your custom logic here
    hideMarkerUIForPlayer(playerColor)
end

local function appendCardDecal(decals, frontPosition)
    Dlog("cardUI", "appendCardDecal")
    -- Add paper clip decal.
    -- We want it front and back.
    local frontDecal = {
        name = "paperclip",
        url = "https://i.imgur.com/A1ljX7A.png",
        rotation = decalFrontRotation,
        position = frontPosition,
        scale = decalScale,
    }
    table.insert(decals, frontDecal)

    local backPosition = Vector(frontPosition.x, -frontPosition.y, frontPosition.z)
    local backDecal = {
        name = "paperclip",
        url = "https://i.imgur.com/A1ljX7A.png",
        rotation = decalBackRotation,
        position = backPosition,
        scale = decalScale,
    }
    table.insert(decals, backDecal)
    return decals
end

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
    if markings ~= nil then
        if markings.price then
            -- Add a paper clip based on the price.
            Dlog("cardUI", "Setting price decals")
            local pricePosition = pricePositions[markings.price]
            appendCardDecal(decals, pricePosition)
        end
        if markings.isHalfPrice then
            -- Add a paper clip for half price.
            Dlog("cardUI", "Setting half price decals")
            appendCardDecal(decals, halfPricePosition)
        end
        if markings.isTorn then
            -- Add a paper clip for torn.
            Dlog("cardUI", "Setting torn decals")
            appendCardDecal(decals, tornPosition)
        end
    end
    -- Set the decals for card.
    card.setDecals(decals)
end

local function setPriceInternal(player, price)
    Dlog("cardMarking", "price: " .. tostring(price))
    local singleItemCard, cardName, markings = getSingleItemCardWithNameAndMarkings(player)
    if not (singleItemCard and cardName and markings) then
        Dlog("cardMarking", "setPriceInternal 001")
        return
    end
    -- Set the price, update the UI.
    markings.price = price
    cardMarkingsByName[cardName] = markings
    Ddump("cardMarking", "setPriceInternal cardMarkingsByName = ", cardMarkingsByName)

    -- Update the UI for the card.
    updateCardUI(singleItemCard)
end

local function isPointInHandZone(pos, transform)
    local scale = transform.scale
    local center = transform.position

    return math.abs(pos.x - center.x) <= scale.x / 2 and
        math.abs(pos.y - center.y) <= scale.y / 2 and
        math.abs(pos.z - center.z) <= scale.z / 2
end

local function isInAnyHandZone(card)
    local cardPos = card.getPosition()

    local seatedPlayers = getSeatedPlayers()
    for _, seatedPlayer in pairs(seatedPlayers) do
        if seatedPlayer then
            local handTransform = seatedPlayer.getHandTransform(1) -- 1 = main hand
            if isPointInHandZone(cardPos, handTransform) then
                Dlog("cardFlips", card.getName() .. " is in " .. seatedPlayer.color .. "'s hand.")
                return true
            end
        end
    end

    Dlog("cardFlips", card.getName() .. " is not in any hand.")
    return false
end

local function checkCardFlipForCard(itemCard)
    DLog("cardFlips", "checkCardFlip")
    if isInAnyHandZone(itemCard) then
        return
    end

    -- It's on the table.
    -- Is it priced?
    local _, markings = getNameAndMarkingsForCard(itemCard)
    if markings == nil or markings.price == nil or markings.price == 0 then
        -- This is unpriced: keep it face down.
        enforceOrientation(itemCard, false)
    else
        enforceOrientation(itemCard, true)
    end
end


--[[
    Non local functions.  Called as coroutines.
]]
-- Loop step from onLoad.
-- This one worries about adding/removing the UI to edit a card iff the player has exactly one
-- card in hand.
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

function checkCardFlips()
    Dlog("cardFlips", "checkCardFlips")
    local taggedObjects = getObjectsWithTag(itemCardTag)

    for _, itemCard in ipairs(taggedObjects) do
        checkCardFlipForCard(itemCard)
    end
end

-- Button click handlers.
-- Called from XML file.
function SetPriceUnknown(player, value, id)
    Dlog("cardMarking", "In SetPriceUnknown")
    setPriceInternal(player, nil)
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

function ToggleHalfPrice(player)
    Dlog("cardMarking", "ToggleHalfPrice")
    local singleItemCard, cardName, markings = getSingleItemCardWithNameAndMarkings(player)
    if not (singleItemCard and cardName and markings) then
        Dlog("cardMarking", "setPriceInternal 001")
        return
    end

    -- Flip half price, update the UI.
    local isHalfPrice = markings.isHalfPrice and true or false
    markings.isHalfPrice = (not isHalfPrice)
    cardMarkingsByName[cardName] = markings
    Ddump("cardMarking", "ToggleHalfPrice cardMarkingsByName = ", cardMarkingsByName)

    -- Update the UI for the card.
    updateCardUI(singleItemCard)
end

function ToggleTorn(player)
    Dlog("cardMarking", "ToggleTorn")
    local singleItemCard, cardName, markings = getSingleItemCardWithNameAndMarkings(player)
    if not (singleItemCard and cardName and markings) then
        Dlog("cardMarking", "setPriceInternal 001")
        return
    end

    -- Flip torn, update the UI.
    local isTorn = markings.isTorn and true or false
    markings.isTorn = (not isTorn)
    cardMarkingsByName[cardName] = markings
    Ddump("cardMarking", "ToggleHalfPrice cardMarkingsByName = ", cardMarkingsByName)

    -- Update the UI for the card.
    updateCardUI(singleItemCard)
end

--[[
    API LEVEL FUNCTIONS
]]
function onLoad()
    Dlog("global", "onLoad started")
    Timer.create({
        identifier = "LoopA",
        function_name = "checkHandSizes",
        delay = secBetweenCheckHandSizes,
        repetitions = 0 -- 0 = infinite
    })

    Timer.create({
        identifier = "LoopB",
        function_name = "checkCardFlips",
        delay = secBetweenCheckCardFlips,
        repetitions = 0
    })
end

-- Make sure that all the cards in the item deck are tagged as ItemCards.
-- Also give each card a unique ID that will persist when put back into
-- a deck (card GUID does not persist).
function onObjectLeaveContainer(container, object)
    Dlog("global", "onObjectLeaveContainer.")
    Dlog("cardTagging", "onObjectLeaveContainer.")
    -- It'd be nice to check on the GUID of the container here.
    -- But someone could split big deck into smaller decks and then we are in trouble.
    -- Given that the only deck in the game is the item deck, I'm just going to test types and tags on the contanier.
    if not container.hasTag(itemDeckTag) then
        Dlog("cardTagging", "onObjectLeaveContainer: no tag.")
        return
    end
    Dlog("cardTagging", "onObjectLeaveContainer: container.type = " .. container.type)
    Dlog("cardTagging", "onObjectLeaveContainer: object.type = " .. object.type)
    if container.type == "Deck" and object.type == "Card" then
        Dlog("cardTagging", "onObjectLeaveContainer: applying tag.")
        -- This is an item card.
        object.addTag(itemCardTag)
        -- Give it an ID, written into the name field, only if we didn't already do that.
        local name = object.getName()
        if name == "" or name == nil then
            nextCardId = nextCardId + 1
            object.setName(itemCardNamePrefix .. nextCardId)
        end
        -- Update the card UI based on the name.
        updateCardUI(object)
    end
end
