use printpdf::*;
use tauri::{AppHandle, Manager};

use super::styles::PdfStyle;

use crate::pdf::layouts::{
    header::PdfHeader,
    footer::PdfFooter,
};

use std::{ path::PathBuf};

const TOP_MARGIN: f32 = 10.0;
pub struct PdfContext {

    pub font: FontId,
    pub doc: PdfDocument,
    pub ops: Vec<Op>,
    pub pages: Vec<PdfPage>,

    pub width: Mm,
    pub height: Mm,
    pub cursor_y: f32,
    pub style: PdfStyle,
    pub current_page: usize,

    pub header: Option<PdfHeader>,
    pub footer: Option<PdfFooter>,

}

impl PdfContext {
    pub fn set_layout(

        &mut self,
        header: PdfHeader,
        footer: PdfFooter,

    ) {

        self.header = Some(header);
        self.footer = Some(footer);

    }
}

fn resolve_font_path(app: &AppHandle) -> Option<String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("resources/fonts/DejaVuSans.ttf"));
        candidates.push(resource_dir.join("fonts/DejaVuSans.ttf"));
    }

    candidates.push(PathBuf::from("resources/fonts/DejaVuSans.ttf"));
    candidates.push(PathBuf::from("src-tauri/resources/fonts/DejaVuSans.ttf"));

    candidates
        .into_iter()
        .find(|path| path.exists())
        .map(|path| path.to_string_lossy().to_string())
}

impl PdfContext {

    fn create(
        app: &AppHandle,
        title: &str,
        width: Mm,
        height: Mm,
    ) -> Result<Self, String> {

        let mut doc = PdfDocument::new(title);

        // =========================
        // CHARGEMENT POLICE
        // =========================

        let font_path = resolve_font_path(app)
            .ok_or("Police DejaVuSans.ttf introuvable")?;

        let font_bytes = std::fs::read(&font_path)
            .map_err(|e| {
                format!(
                    "Impossible de lire {} : {}",
                    font_path,
                    e
                )
            })?;

        let parsed_font =
            ParsedFont::from_bytes(
                &font_bytes,
                0,
                &mut Vec::new(),
            )
            .ok_or(
                "Impossible de charger la police DejaVuSans"
                    .to_string()
            )?;

        let font = doc.add_font(&parsed_font);

        Ok(Self {
            font,
            doc,
            ops: Vec::new(),
            pages: Vec::new(),

            width,
            height,

            cursor_y: height.0 - TOP_MARGIN,

            style: PdfStyle::default(),

            current_page: 1,

            header: None,
            footer: None,
        })
    }


    // =========================
    // PAYSAGE
    // =========================

    pub fn new_landscape(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::create(
            app,
            title,
            Mm(297.0),
            Mm(210.0),
        )
    }


    // =========================
    // PORTRAIT
    // =========================

    pub fn new_portrait(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::create(
            app,
            title,
            Mm(210.0),
            Mm(297.0),
        )
    }


    // =========================
    // PAR DÉFAUT
    // =========================

    pub fn new(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::new_landscape(
            app,
            title,
        )
    }

}

impl PdfContext {

    pub fn finish(&mut self) -> Result<(), String> {

        // Dernière page
        if !self.ops.is_empty() {

            // Footer dernière page
            if let Some(footer) = self.footer.clone() {
                footer.render(self)?;
            }

            let ops = std::mem::take(&mut self.ops);

            self.pages.push(
                PdfPage::new(
                    self.width,
                    self.height,
                    ops,
                )
            );
        }

        self.doc.with_pages(
            std::mem::take(&mut self.pages)
        );

        Ok(())
    }

}
