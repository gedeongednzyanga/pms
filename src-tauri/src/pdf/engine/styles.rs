use printpdf::*;


#[derive(Clone)]
pub struct PdfStyle {

    pub font_size: f32,
    pub title_size: f32,
    pub subtitle_size: f32,
    pub text_color: Color,
    pub border_color: Color,
    pub background_color: Color,

}

impl Default for PdfStyle {
    fn default() -> Self {
        Self {
            font_size: 9.0,
            title_size: 14.0,
            subtitle_size: 11.0,

            text_color: Color::Rgb(
                Rgb::new(
                    0.0,
                    0.0,
                    0.0,
                    None
                )
            ),

            border_color: Color::Rgb(
                Rgb::new(
                    0.0,
                    0.0,
                    0.0,
                    None
                )
            ),

            background_color: Color::Rgb(
                Rgb::new(
                    0.95,
                    0.95,
                    0.95,
                    None
                )
            ),
        }
    }
}