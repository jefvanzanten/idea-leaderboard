use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use uuid::Uuid;

#[tauri::command]
fn copy_image_to_app_data(app: tauri::AppHandle, source_path: String) -> Result<String, String> {
    let source = PathBuf::from(&source_path);

    let ext = source
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png");

    let filename = format!("{}.{}", Uuid::new_v4(), ext);

    let images_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("images");

    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;

    let dest = images_dir.join(&filename);
    fs::copy(&source, &dest).map_err(|e| e.to_string())?;

    let dest_str = dest.to_string_lossy().to_string();
    Ok(dest_str)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![copy_image_to_app_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
