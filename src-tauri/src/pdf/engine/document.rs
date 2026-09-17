use std::fs::{self, File};
use std::io::{BufWriter, Write};
use std::path::{Path, PathBuf};

use printpdf::*;
use tauri::{AppHandle, Manager};

use super::context::PdfContext;

// GENERATION DU DOSSIER POUR STOCKER LES DOCUMENTS PDF ET AUTRES

pub fn get_pdf_directory(
    app: &AppHandle,
) -> Result<PathBuf, String> {

    let base_dir = match app.path().document_dir() {
        Ok(dir) => dir,
        Err(_) => {
            dirs::home_dir()
                .ok_or("Impossible de trouver le dossier utilisateur")?
                .join("Documents")
        }
    };

    let dir = base_dir.join("PMS").join("PDF");

    fs::create_dir_all(&dir)
        .map_err(|e| format!("Création dossier impossible : {}", e))?;

    Ok(dir)
}

impl PdfContext {
    pub fn save<P: AsRef<Path>>(self, path: P) -> Result<(), String> {
        let path = path.as_ref();

        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| e.to_string())?;
        }

        let file = File::create(path)
            .map_err(|e| e.to_string())?;

        let mut writer = BufWriter::new(file);

        let mut warnings = Vec::new();

        self.doc.save_writer(
            &mut writer,
            &PdfSaveOptions::default(),
            &mut warnings,
        );

        writer.flush()
            .map_err(|e| e.to_string())?;

        if !warnings.is_empty() {
            eprintln!("PDF warnings: {warnings:#?}");
        }

        Ok(())
    }
}
