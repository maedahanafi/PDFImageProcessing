# TextureBackend
Texture file structure:
- PDF and image processing module: 
	./bbr/textureCore/image_processing/
- Basic synth: 
	./bbr/textureCore/learn/
- Basic DSL processor
	./bbr/textureCore/traverse/
- Basic UI
	./bbr/textureCore/app/
	./bbr/textureCore/node_modules/
	./bbr/textureCore/public/

#Image processing module
To run:
1. In directory ./bbr run source venv/bin/activate
2. Navigate to ./bbr/textureCore/image_processing/box
3. Run: 
	./crop_morphology.py path/to/image
   Path to image must be under /box.
   For instance: 
   	./crop_morphology.py ./img/obama.png
4. The document structure extracted will be displayed in console and can be found in
	./bbr/textureCore/app/	
