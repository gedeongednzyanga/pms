
use crate::pdf::engine::context::PdfContext;

#[derive(Clone)]
pub struct PdfFooter {

    pub company_name: String,
    pub generated_date: String,
    pub show_page_number: bool,

}

impl PdfFooter {

    pub fn render(
        &self,

        pdf: &mut PdfContext,

    ) -> Result<(), String> {

        let y = 15.0;
        // =========================
        // LIGNE SEPARATION
        // =========================
        pdf.line(
            15.0,
            20.0,
            pdf.width.0 - 15.0,
            20.0,
        );

        // =========================
        // NOM ETABLISSEMENT
        // =========================
        pdf.text(
            &self.company_name,
            15.0,
            y,
            8.0,
            // font,

        );

        // =========================
        // DATE GENERATION
        // =========================

        pdf.text(
            &self.generated_date,
            80.0,
            y,
            8.0,
            // font,

        );

        // =========================
        // NUMERO PAGE
        // =========================

        if self.show_page_number {
            let page =
                format!(
                    "Page {}",
                    pdf.current_page
                );

            pdf.text(

                &page,
                pdf.width.0 - 35.0,
                y,
                8.0,
                // font,

            );
        }

        Ok(())

    }


}
