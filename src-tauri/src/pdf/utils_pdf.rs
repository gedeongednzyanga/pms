use std::fs;

use base64::{Engine, engine::general_purpose};
use printpdf::{BuiltinFont, Color, Line, LinePoint, Mm, Op, PaintMode, Point, Polygon, PolygonRing, Pt, Rgb, TextItem, TextMatrix, WindingOrder};

// FONCTION POUR ECRIRE LE TEXTES
pub fn write_text(
    ops: &mut Vec<Op>,
    font: BuiltinFont,
    size: f32,
    x: f32,
    y: f32,
    text: &str,
) {
    ops.push(Op::SetFontSizeBuiltinFont {
        size: Pt(size),
        font: font.clone(),
    });

    ops.push(Op::SetTextMatrix {
        matrix: TextMatrix::Translate(
            Mm(x).into(),
            Mm(y).into(),
        ),
    });

    ops.push(Op::WriteTextBuiltinFont {
        items: vec![
            TextItem::Text(text.to_string())
        ],
        font,
    });
}

// Fonction pour dessiner une ligne
pub fn draw_line(
    ops: &mut Vec<Op>,
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
) {
    ops.push(Op::DrawLine {
        line: Line {
            points: vec![
                LinePoint {
                    p: Point::new(Mm(x1), Mm(y1)),
                    bezier: false,
                },
                LinePoint {
                    p: Point::new(Mm(x2), Mm(y2)),
                    bezier: false,
                },
            ],
            is_closed: false,
        },
    });
}

pub fn draw_rect(
    ops: &mut Vec<Op>,
    x: f32,
    y: f32,
    width: f32,
    height: f32,
) {
    // Fond gris
    ops.push(Op::SetFillColor {
        col: Color::Rgb(Rgb::new(0.9, 0.9, 0.9, None)),
    });

    ops.push(Op::DrawPolygon {
        polygon: Polygon {
            rings: vec![PolygonRing {
                points: vec![
                    LinePoint { p: Point::new(Mm(x), Mm(y)), bezier: false },
                    LinePoint { p: Point::new(Mm(x + width), Mm(y)), bezier: false },
                    LinePoint { p: Point::new(Mm(x + width), Mm(y - height)), bezier: false },
                    LinePoint { p: Point::new(Mm(x), Mm(y - height)), bezier: false },
                ],
            }],
            mode: PaintMode::Fill,
            winding_order: WindingOrder::NonZero,
        },
    });

    // Bordures
    draw_line(ops, x, y, x + width, y);
    draw_line(ops, x + width, y, x + width, y - height);
    draw_line(ops, x + width, y - height, x, y - height);
    draw_line(ops, x, y - height, x, y);
}

#[tauri::command]
pub fn read_pdf_file(path: String) -> Result<String, String> {
    let bytes = fs::read(&path)
        .map_err(|e| e.to_string())?;

    let encoded = general_purpose::STANDARD.encode(bytes);

    Ok(encoded)
}