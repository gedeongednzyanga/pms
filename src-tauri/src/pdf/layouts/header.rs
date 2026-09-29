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
    pub fn render(&self, pdf: &mut PdfContext) -> Result<(), String> {
        let start_y = pdf.cursor_y;
        let page_w = pdf.width.0;

        // =========================
        // LOGO (proportions conservées)
        // =========================
        let mut logo_h = 0.0_f32;

        if let Some(path) = &self.logo {
            let (px_w, px_h) = image::image_dimensions(path)
                .map_err(|e| format!("Logo illisible ({}): {}", path, e))?;

            let ratio = px_w as f32 / px_h as f32;

            let max_w = page_w - 30.0; // marges de 15 mm
            let max_h = 28.0;          // hauteur maximale du logo

            let mut h = max_h;
            let mut w = h * ratio;
            if w > max_w {
                w = max_w;
                h = w / ratio;
            }

            let x = (page_w - w) / 2.0; // centré
            pdf.image(path, x, start_y - h, w, h)?;
            logo_h = h;
        }

        // =========================
        // TEXTES (sous le logo)
        // =========================
        let mut y = start_y - logo_h - 2.0;
        // let center_x = 15.0;

        // pdf.title(&self.school_name, center_x, y);
        // y -= 7.0;
        // pdf.text(&self.address, center_x, y, 9.0);
        // y -= 6.0;
        // pdf.text(&self.phone, center_x, y, 9.0);
        // y -= 6.0;
        // pdf.text(&self.email, center_x, y, 9.0);

        // =========================
        // SEPARATION
        // =========================
        y -= 4.0;
        pdf.line(15.0, y, page_w - 15.0, y);

        pdf.cursor_y = y - 8.0;
        Ok(())
    }
}

// impl PdfHeader {
//     pub fn render(
//         &self,
//         pdf: &mut PdfContext,
//     ) -> Result<(), String> {

//         let start_y = pdf.cursor_y;

//         // =========================
//         // LOGO
//         // =========================

//         if let Some(path) = &self.logo {
//             pdf.image(
//                 path,
//                 15.0,
//                 start_y - 25.0,
//                 25.0,
//                 25.0,
//             )?;
//         }

//         // =========================
//         // INFORMATIONS ENTREPRISE
//         // =========================

//         let text_x = 45.0;

//         // Nom de l'école
//         pdf.title(
//             &self.school_name,
//             text_x,
//             start_y - 5.0,
//         );

//         // Adresse
//         pdf.text(
//             &self.address,
//             text_x,
//             start_y - 12.0,
//             9.0,
//         );

//         // Téléphone
//         pdf.text(
//             &self.phone,
//             text_x,
//             start_y - 18.0,
//             9.0,
//         );

//         // Email
//         pdf.text(
//             &self.email,
//             text_x,
//             start_y - 24.0,
//             9.0,
//         );

//         // =========================
//         // SEPARATION
//         // =========================

//         pdf.line(
//             15.0,
//             start_y - 30.0,
//             pdf.width.0 - 15.0,
//             start_y - 30.0,
//         );

//         // =========================
//         // NOUVEAU CURSEUR
//         // =========================

//         pdf.cursor_y = start_y - 38.0;

//         Ok(())
//     }
// }