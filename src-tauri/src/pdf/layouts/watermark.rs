// use printpdf::*;

use crate::pdf::engine::context::PdfContext;


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
                start_y,
                20.0,
                20.0,
            )?;
        }

        // =========================
        // NOM ECOLE
        // =========================
        pdf.title(
            &self.school_name,
            45.0,
            start_y - 5.0,
            // BuiltinFont::HelveticaBold,

        );

        // Adresse
        pdf.text(
            &self.address,
            45.0,
            start_y - 12.0,
            9.0,
            // font,

        );

        // Téléphone

        pdf.text(
            &self.phone,
            45.0,
            start_y - 17.0,
            9.0,
            // font,

        );

        // Email

        pdf.text(
            &self.email,
            45.0,
            start_y - 22.0,
            9.0,
            // font,

        );

        // =========================
        // SEPARATION
        // =========================

        pdf.line(
            15.0,
            start_y - 28.0,
            195.0,
            start_y - 28.0,

        );

        // Mise à jour curseur

        pdf.cursor_y = start_y - 35.0;

        Ok(())

    }


}