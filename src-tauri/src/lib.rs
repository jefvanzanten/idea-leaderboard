use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const SUPPORTED_EXTENSIONS: &[&str] = &[
    "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif",
];

#[derive(Serialize)]
struct ScanResult {
    count: usize,
    files: Vec<String>,
}

#[derive(Serialize)]
struct ConvertResult {
    converted: usize,
    failed: usize,
    errors: Vec<String>,
    output_path: String,
}

fn is_supported_image(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| SUPPORTED_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[tauri::command]
fn scan_folder(path: String) -> Result<ScanResult, String> {
    let dir = PathBuf::from(&path);
    if !dir.is_dir() {
        return Err(format!("'{}' is not a valid directory", path));
    }

    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    let files: Vec<String> = entries
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.is_file() && is_supported_image(path))
        .filter_map(|path| path.to_str().map(String::from))
        .collect();

    Ok(ScanResult {
        count: files.len(),
        files,
    })
}

#[tauri::command]
async fn convert_images(
    source_path: String,
    width: u32,
    height: u32,
    quality: f32,
) -> Result<ConvertResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        convert_images_blocking(&source_path, width, height, quality)
    })
    .await
    .map_err(|e| e.to_string())?
}

fn convert_images_blocking(
    source_path: &str,
    width: u32,
    height: u32,
    quality: f32,
) -> Result<ConvertResult, String> {
    let dir = PathBuf::from(source_path);
    let output_dir = dir.join("thumbnails");

    fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    let image_files: Vec<PathBuf> = entries
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.is_file() && is_supported_image(path))
        .collect();

    let mut converted = 0usize;
    let mut failed = 0usize;
    let mut errors = Vec::new();

    for file_path in &image_files {
        match process_single_image(file_path, &output_dir, width, height, quality) {
            Ok(()) => converted += 1,
            Err(e) => {
                let filename = file_path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy();
                errors.push(format!("{}: {}", filename, e));
                failed += 1;
            }
        }
    }

    Ok(ConvertResult {
        converted,
        failed,
        errors,
        output_path: output_dir.to_string_lossy().to_string(),
    })
}

fn process_single_image(
    file_path: &Path,
    output_dir: &Path,
    width: u32,
    height: u32,
    quality: f32,
) -> Result<(), String> {
    let img = image::open(file_path).map_err(|e| e.to_string())?;

    let thumbnail = img.thumbnail(width, height);

    let encoder = webp::Encoder::from_image(&thumbnail)
        .map_err(|e| format!("WebP encoder error: {}", e))?;
    let webp_data = encoder.encode(quality);

    let stem = file_path
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy();
    let output_path = output_dir.join(format!("{}.webp", stem));

    fs::write(&output_path, &*webp_data).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![scan_folder, convert_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
