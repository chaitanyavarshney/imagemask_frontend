/* eslint-disable no-unused-vars */
import { useRef, useState } from 'react';
import CanvasDraw from 'react-canvas-draw';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import axios from 'axios';
import Button from '../../components/Button'; // Import the Button component

export const Login = () => {
	const canvasRef = useRef(null);
	const [brushRadius, setBrushRadius] = useState(4);
	const [backgroundImage, setBackgroundImage] = useState(null);
	const [maskedImage, setMaskedImage] = useState(null);
	const [isLoading, setIsLoading] = useState(false); // State for loading indicator
	const [uploadedImageUrls, setUploadedImageUrls] = useState(null); // State for uploaded image URLs

	// Handle image upload for background
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				setBackgroundImage(event.target.result);
			};
			reader.readAsDataURL(file);
			setMaskedImage(null);
			if (canvasRef.current) {
				canvasRef.current.clear();
			}
		} else {
			alert('Please upload a valid image file.');
		}
	};

	// Save drawing as image
	const saveAsImage = () => {
		if (isLoading) return;
		if (canvasRef.current) {
			const canvas = document.createElement('canvas');

			const ctx = canvas.getContext('2d');

			// Fill the canvas with a black background
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw the masked image onto the black background
			const maskedCanvas = canvasRef.current.canvas.drawing;
			ctx.drawImage(maskedCanvas, 0, 0, canvas.width, canvas.height);

			// Get the data URL of the resulting image
			const dataURL = canvas.toDataURL();
			setMaskedImage(dataURL);
			uploadImage(backgroundImage, dataURL);
		}
	};

	// Convert base64 to Blob
	const base64ToBlob = (base64Data, mimeType) => {
		const byteCharacters = atob(base64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
			const slice = byteCharacters.slice(offset, offset + 1024);
			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		return new Blob(byteArrays, { type: mimeType });
	};

	// Reusable API call to upload both background and mask images
	const uploadImage = async (image, mask) => {
		setIsLoading(true); // Start loading

		try {
			const formData = new FormData();

			// Convert base64 to blob
			if (image.split(',')[1] && mask.split(',')[1]) {
				const imageBlob = base64ToBlob(image.split(',')[1], 'image/jpeg');
				const maskBlob = base64ToBlob(mask.split(',')[1], 'image/png');

				// Append the files with appropriate keys
				formData.append('image', imageBlob, 'background.jpg');
				formData.append('mask', maskBlob, 'masked.png');

				// Replace the URL with your FastAPI endpoint
				const response = await axios.post('http://localhost:8000/upload/', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});

				// Handle the successful response
				setUploadedImageUrls((prevUrls) => ({
					...prevUrls,
					backgroundImage: response.data.image_data.s3_url,
					maskedImage: response.data.mask_data.s3_url,
				}));
			}

			setIsLoading(false); // Stop loading
		} catch (error) {
			console.error('Error uploading images:', error);
			setIsLoading(false); // Stop loading on error
		}
	};
	// Clear the canvas
	const clearCanvas = () => {
		if (canvasRef.current) {
			canvasRef.current.clear();
		}
	};

	return (
		<div style={{ padding: '20px', textAlign: 'center' }}>
			<div style={{ marginBottom: '20px' }}>
				<label htmlFor="image-upload" style={{ display: 'block', marginBottom: '10px' }}>
					Upload Background Image:
				</label>
				<input
					type="file"
					id="image-upload"
					accept="image/*"
					onChange={handleImageUpload}
					style={{ margin: '0 auto' }}
				/>
			</div>

			{/* CanvasDraw Component */}
			<CanvasDraw
				ref={canvasRef}
				brushRadius={brushRadius}
				brushColor="white"
				backgroundColor={backgroundImage ? 'transparent' : '#D3D3D3'}
				canvasWidth={500}
				canvasHeight={500}
				style={{ border: '1px solid #ccc', margin: '20px auto' }}
				imgSrc={backgroundImage}
			/>

			<div style={{ margin: '10px 0' }}>
				<label htmlFor="brush-radius" style={{ display: 'block', marginBottom: '10px' }}>
					Adjust Brush Radius: {brushRadius}
				</label>
				<Slider
					id="brush-radius"
					value={brushRadius}
					onChange={(value) => setBrushRadius(value)}
					min={1}
					max={20}
					step={1}
					style={{ width: '300px', margin: '0 auto' }}
				/>
			</div>

			{/* Reusable Button Components */}
			<Button onClick={saveAsImage} color="#007BFF">
				Save as Image
			</Button>

			<Button onClick={clearCanvas} color="#DC3545">
				Clear Drawing
			</Button>

			{/* Show loader while uploading */}
			{isLoading && <div>Uploading...</div>}

			{/* Display Original and Masked Image Side by Side */}
			{uploadedImageUrls && !isLoading && maskedImage && (
				<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
					<div style={{ textAlign: 'center', marginRight: '20px' }}>
						<h4>Uploaded Image</h4>
						<img
							src={uploadedImageUrls.backgroundImage}
							alt="Uploaded"
							style={{
								width: '300px',
								height: '300px',
								border: '1px solid #ccc',
								objectFit: 'cover',
							}}
						/>
					</div>
					<div style={{ textAlign: 'center' }}>
						<h4>Masked Image</h4>
						<img
							src={uploadedImageUrls.maskedImage}
							alt="Masked"
							style={{
								width: '300px',
								height: '300px',
								border: '1px solid #ccc',
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
