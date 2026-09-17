use printpdf::*;

use super::context::PdfContext;


impl PdfContext {


    // =========================
    // TEXTE SIMPLE
    // =========================

    pub fn text(
        &mut self,
        text: &str,
        x: f32,
        y: f32,
        size: f32,
        // font: BuiltinFont,

    ) {

        // Couleur texte noire
        self.ops.push(
            Op::SetFillColor {
                col: Color::Rgb(
                    Rgb::new(
                        0.0,
                        0.0,
                        0.0,
                        None
                    )
                ),
            }
        );

        self.ops.push(
            Op::StartTextSection
        );

        self.ops.push(
            Op::SetFontSize { 
                size: Pt(size), 
                font: self.font.clone() 
            }
        );

        // SetfontSize {
        //         size: Pt(size),
        //         font: self.font.clone(),
        //     }

        self.ops.push(
            Op::SetTextCursor {
                pos: Point::new(
                    Mm(x),
                    Mm(y),
                ),
            }
        );

        self.ops.push(
            Op::WriteText {

                items: vec![

                    TextItem::Text(
                        text.trim().to_string()
                    )

                ],
                font: self.font.clone(),

            }
        );



        self.ops.push(
            Op::EndTextSection
        );

    }



    // =========================
    // TITRE
    // =========================

    pub fn title(
        &mut self,
        text: &str,
        x: f32,
        y: f32,
        // font: BuiltinFont,
    ) {

        self.text(
            text,
            x,
            y,
            self.style.title_size,
        );

    }



    // =========================
    // SOUS TITRE
    // =========================

    pub fn subtitle(
        &mut self,
        text: &str,
        x: f32,
        y: f32,
        // font: BuiltinFont,
    ) {


        self.text(
            text,
            x,
            y,
            self.style.subtitle_size,
            // font,
        );

    }



    // =========================
    // PARAGRAPHE
    // =========================

    pub fn paragraph(
        &mut self,
        text: &str,
        x: f32,
        y: f32,
        // font: BuiltinFont,
    ) {


        self.text(
            text,
            x,
            y,
            self.style.font_size,
            // font,
        );


    }


}