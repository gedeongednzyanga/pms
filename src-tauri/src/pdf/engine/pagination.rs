use super::context::PdfContext;


impl PdfContext {
    // =========================
    // VERIFICATION ESPACE
    // =========================

    pub fn check_space(
        &mut self,
        required_height: f32,
    ) -> bool {
        let bottom_margin = 20.0;
        if self.cursor_y - required_height < bottom_margin {

            self.new_page();
            return false;

        }
        true

    }

    // =========================
    // SAUT DE PAGE FORCE
    // =========================

    pub fn page_break(
        &mut self,
    ) {

        self.new_page();

    }

    // =========================
    // POSITION ACTUELLE
    // =========================

    pub fn current_position(
        &self,
    ) -> f32 {
        self.cursor_y

    }

    pub fn ensure_space(
        &mut self,
        height: f32,
    ) {

        if self.cursor_y - height < 30.0 {

            self.new_page();

        }
    }


}