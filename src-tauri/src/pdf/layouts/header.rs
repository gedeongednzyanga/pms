// use printpdf::*;

use crate::pdf::engine::context::PdfContext;


#[derive(Clone)]
pub struct PdfHeader {

    pub school_name: String,
    pub address: String,
    pub phone: String,
    pub email: String,
    pub logo: Option<String>,

}

impl PdfHeader {
    pub fn render(
        &self,
        pdf: &mut PdfContext,
    ) -> Result<(), String> {

        let start_y = pdf.cursor_y;

        // =========================
        // LOGO
        // =========================

        if let Some(path) = &self.logo {
            pdf.image(
                path,
                15.0,
                start_y - 25.0,
                25.0,
                25.0,
            )?;
        }

        // =========================
        // INFORMATIONS ECOLE
        // =========================

        let text_x = 45.0;

        // Nom de l'école
        pdf.title(
            &self.school_name,
            text_x,
            start_y - 5.0,
        );

        // Adresse
        pdf.text(
            &self.address,
            text_x,
            start_y - 12.0,
            9.0,
        );

        // Téléphone
        pdf.text(
            &self.phone,
            text_x,
            start_y - 18.0,
            9.0,
        );

        // Email
        pdf.text(
            &self.email,
            text_x,
            start_y - 24.0,
            9.0,
        );

        // =========================
        // SEPARATION
        // =========================

        pdf.line(
            15.0,
            start_y - 30.0,
            pdf.width.0 - 15.0,
            start_y - 30.0,
        );

        // =========================
        // NOUVEAU CURSEUR
        // =========================

        pdf.cursor_y = start_y - 38.0;

        Ok(())
    }
}