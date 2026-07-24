export interface PreparedEvidencePhoto {
    previewUrl: string;
    blob: Blob;
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
    fileSizeBytes: number;
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

function canvasBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Unable to compress this image."))),
            "image/jpeg",
            0.78
        );
    });
}

export async function prepareEvidencePhoto(file: File): Promise<PreparedEvidencePhoto> {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Use a JPEG, PNG, or WebP image.");
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Photo must be smaller than 10 MB.");
    }

    const original = await readFile(file);
    const image = await loadImage(original);
    const maximumDimension = 1600;
    const scale = Math.min(1, maximumDimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");

    let blob: Blob;
    let mimeType: PreparedEvidencePhoto["mimeType"];
    if (!context) {
        blob = file;
        mimeType = file.type as PreparedEvidencePhoto["mimeType"];
    } else {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        blob = await canvasBlob(canvas);
        mimeType = "image/jpeg";
    }

    return {
        previewUrl: URL.createObjectURL(blob),
        blob,
        fileName: file.name,
        mimeType,
        fileSizeBytes: blob.size,
    };
}
