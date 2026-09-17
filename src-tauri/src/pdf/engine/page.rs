use printpdf::*;

use super::context::PdfContext;

const TOP_MARGIN: f32 = 10.0;

impl PdfContext {
    // =========================
    // NOUVELLE PAGE
    // =========================

    pub fn new_page(&mut self) {

        // Ne rien faire si la page actuelle est vide
        if self.ops.is_empty() {
            return;
        }

        // =========================
        // FOOTER PAGE ACTUELLE
        // =========================

        if let Some(footer) = self.footer.clone() {
            if let Err(e) = footer.render(self) {
                eprintln!("Erreur footer : {}", e);
            }
        }

        // =========================
        // SAUVEGARDER PAGE ACTUELLE
        // =========================

        let old_ops = std::mem::take(&mut self.ops);

        self.pages.push(
            PdfPage::new(
                self.width,
                self.height,
                old_ops,
            )
        );

        // =========================
        // PAGE SUIVANTE
        // =========================

        self.current_page += 1;

        // Marge supérieure
        self.cursor_y = self.height.0 - TOP_MARGIN;

        // =========================
        // HEADER NOUVELLE PAGE
        // =========================

        if let Some(header) = self.header.clone() {
            if let Err(e) = header.render(self) {
                eprintln!("Erreur header : {}", e);
            }
        }
    }

    // pub fn new_page(&mut self) {

    //     // Ne rien faire si la page actuelle est vide
    //     if self.ops.is_empty() {
    //         return;
    //     }

    //     // =========================
    //     // FOOTER PAGE ACTUELLE
    //     // =========================

    //     if let Some(footer) = self.footer.clone() {
    //         if let Err(e) = footer.render(self) {
    //             eprintln!("Erreur footer : {}", e);
    //         }
    //     }

    //     // =========================
    //     // SAUVEGARDER PAGE ACTUELLE
    //     // =========================

    //     let old_ops = std::mem::take(&mut self.ops);

    //     self.pages.push(
    //         PdfPage::new(
    //             self.width,
    //             self.height,
    //             old_ops,
    //         )
    //     );

    //     // =========================
    //     // PAGE SUIVANTE
    //     // =========================

    //     self.current_page += 1;

    //     self.cursor_y = self.height.0 - 30.0;

    //     // =========================
    //     // HEADER NOUVELLE PAGE
    //     // =========================

    //     if let Some(header) = self.header.clone() {
    //         if let Err(e) = header.render(self) {
    //             eprintln!("Erreur header : {}", e);
    //         }
    //     }
    // }
    
    // =========================
    // POSITION CURSEUR
    // =========================

    pub fn set_cursor(
        &mut self,
        y: f32,
    ) {

        self.cursor_y = y;

    }

    // =========================
    // DESCENDRE
    // =========================

    pub fn move_down(
        &mut self,
        value: f32,
    ) {

        self.cursor_y -= value;

    }

    // =========================
    // ESPACE DISPONIBLE
    // =========================

    pub fn available_height(
        &self,
    ) -> f32 {
        self.cursor_y - 20.0

    }
}
