
use std::path::Path;

use tauri::AppHandle;

use super::context::PdfContext;


// =====================================================
// ORIENTATION
// =====================================================

pub enum PdfOrientation {
    Portrait,
    Landscape,
}


// =====================================================
// REPORT
// =====================================================

pub trait PdfReport {

    fn render(
        &self,
        pdf: &mut PdfContext,
    ) -> Result<(), String>;

}


// =====================================================
// RENDERER
// =====================================================

pub struct PdfRenderer {

    pub pdf: PdfContext,

}


impl PdfRenderer {

    // =================================================
    // PAYSAGE PAR DÉFAUT
    // =================================================

    pub fn new(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::new_landscape(
            app,
            title,
        )
    }


    // =================================================
    // PORTRAIT
    // =================================================

    pub fn new_portrait(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        let pdf =
            PdfContext::new_portrait(
                app,
                title,
            )?;

        Ok(Self {
            pdf,
        })
    }


    // =================================================
    // PAYSAGE
    // =================================================

    pub fn new_landscape(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        let pdf =
            PdfContext::new_landscape(
                app,
                title,
            )?;

        Ok(Self {
            pdf,
        })
    }


    // =================================================
    // RENDER
    // =================================================

    pub fn render<R: PdfReport>(
        &mut self,
        report: R,
    ) -> Result<(), String> {

        // =========================
        // HEADER
        // =========================

        if let Some(header) =
            self.pdf.header.clone()
        {
            header.render(
                &mut self.pdf
            )?;
        }


        // =========================
        // CONTENU
        // =========================

        report.render(
            &mut self.pdf
        )?;


        // =========================
        // FIN
        // =========================

        self.pdf.finish()?;

        Ok(())
    }


    // =================================================
    // SAVE
    // =================================================

    pub fn save<P: AsRef<Path>>(
        self,
        path: P,
    ) -> Result<(), String> {

        self.pdf.save(path)
    }

}