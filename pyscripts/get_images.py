import openai
import requests
from PIL import Image
from io import BytesIO
import os

# Set your OpenAI API key
openai.api_key = "YOUR_OPENAI_API_KEY"

def generate_image(prompt, output_folder="generated_images"):
    os.makedirs(output_folder, exist_ok=True)

    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="1024x1024",  # Options: "256x256", "512x512", "1024x1024"
            model="dall-e-3"
        )

        image_url = response['data'][0]['url']
        img_data = requests.get(image_url).content
        img = Image.open(BytesIO(img_data))

        filename = f"{prompt.replace(' ', '_')}.png"
        filepath = os.path.join(output_folder, filename)
        img.save(filepath)

        print(f"Saved: {filepath}")

    except Exception as e:
        print(f"Error generating image: {e}")

# Example usage
prompt = "A high-fashion evening gown in monochrome tones, elegant and dramatic."
generate_image(prompt)
