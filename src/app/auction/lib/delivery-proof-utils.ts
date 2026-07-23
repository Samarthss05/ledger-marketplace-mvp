export interface PreparedEvidencePhoto {
    photoDataUrl: string;
    fileName: string;
}

function readFile(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            typeof reader.result === "string"
                ? resolve(reader.result)
                : reject(new Error("Unable to read this image."));
        reader.onerror = () => reject(new Error("Unable to read this image."));
        reader.readAsDataURL(file);
    });
}

function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to process this image."));
        image.src = source;
    });
}

export async function prepareEvidencePhoto(file: File): Promise<PreparedEvidencePhoto> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file.");
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Photo must be smaller than 10 MB.");
    }

    const original = await readFile(file);
    const image = await loadImage(original);
    const maximumDimension = 960;
    const scale = Math.min(1, maximumDimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");

    if (!context) {
        return { photoDataUrl: original, fileName: file.name };
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
        photoDataUrl: canvas.toDataURL("image/jpeg", 0.72),
        fileName: file.name,
    };
}
