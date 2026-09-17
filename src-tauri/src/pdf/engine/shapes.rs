use printpdf::*;


use super::context::PdfContext;

impl PdfContext {
    pub fn set_stroke_color(
        &mut self,
        color: Color,
    ) {

        self.ops.push(
            Op::SetOutlineColor {
                col: color,
            }
        );
    }

    pub fn set_fill_color(
        &mut self,
        color: Color,
    ) {

        self.ops.push(
            Op::SetFillColor {
                col: color,
            }
        );
    }

    pub fn set_line_width(
        &mut self,
        width: f32,
    ) {

        self.ops.push(
            Op::SetOutlineThickness {
                pt: Pt(width),
            }
        );
    }

    // =========================
    // LIGNE
    // =========================

    pub fn line(
        &mut self,
        x1: f32,
        y1: f32,
        x2: f32,
        y2: f32,
    ) {

        self.ops.push(
            Op::DrawLine {

                line: Line {

                    points: vec![

                        LinePoint {
                            p: Point::new(
                                Mm(x1),
                                Mm(y1)
                            ),
                            bezier: false,
                        },

                        LinePoint {
                            p: Point::new(
                                Mm(x2),
                                Mm(y2)
                            ),
                            bezier: false,
                        },

                    ],

                    is_closed: false,

                },

            }
        );

    }



    // =========================
    // RECTANGLE REMPLI
    // =========================

    pub fn rect(
        &mut self,

        x: f32,

        y: f32,

        width: f32,

        height: f32,

        fill: Option<Color>,

        stroke: Option<Color>,

    ) {

        let has_fill = fill.is_some();

        let has_stroke = stroke.is_some();



        if let Some(color) = fill.as_ref() {

            self.set_fill_color(
                color.clone()
            );

        }


        if let Some(color) = stroke.as_ref() {

            self.set_stroke_color(
                color.clone()
            );

        }



        self.set_line_width(0.4);



        let polygon = Polygon {


            rings: vec![

                PolygonRing {

                    points: vec![

                        LinePoint {

                            p: Point::new(
                                Mm(x),
                                Mm(y)
                            ),

                            bezier:false,

                        },


                        LinePoint {

                            p: Point::new(
                                Mm(x + width),
                                Mm(y)
                            ),

                            bezier:false,

                        },


                        LinePoint {

                            p: Point::new(
                                Mm(x + width),
                                Mm(y - height)
                            ),

                            bezier:false,

                        },


                        LinePoint {

                            p: Point::new(
                                Mm(x),
                                Mm(y - height)
                            ),

                            bezier:false,

                        },

                    ],

                }

            ],


            mode: match (has_fill, has_stroke) {


                (true, true) =>
                    PaintMode::FillStroke,


                (true, false) =>
                    PaintMode::Fill,


                (false, true) =>
                    PaintMode::Stroke,


                _ =>
                    PaintMode::Stroke,

            },


            winding_order:
                WindingOrder::NonZero,

        };



        self.ops.push(
            Op::DrawPolygon {
                polygon,
            }
        );

    }


}