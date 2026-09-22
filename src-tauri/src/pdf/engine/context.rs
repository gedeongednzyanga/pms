use printpdf::*;
use tauri::{AppHandle, Manager};

use super::styles::PdfStyle;

use crate::pdf::layouts::{
    header::PdfHeader,
    footer::PdfFooter,
};

use std::{ path::PathBuf};

const TOP_MARGIN: f32 = 10.0;
pub struct PdfContext {

    pub font: FontId,
    pub doc: PdfDocument,
    pub ops: Vec<Op>,
    pub pages: Vec<PdfPage>,

    pub width: Mm,
    pub height: Mm,
    pub cursor_y: f32,
    pub style: PdfStyle,
    pub current_page: usize,

    pub header: Option<PdfHeader>,
    pub footer: Option<PdfFooter>,

}

impl PdfContext {
    pub fn set_layout(

        &mut self,
        header: PdfHeader,
        footer: PdfFooter,

    ) {

        self.header = Some(header);
        self.footer = Some(footer);

    }

    pub fn without_layout(&mut self) {
        self.header = None;
        self.footer = None;
    }
}

fn resolve_font_path(app: &AppHandle) -> Option<String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("resources/fonts/DejaVuSans.ttf"));
        candidates.push(resource_dir.join("fonts/DejaVuSans.ttf"));
    }

    candidates.push(PathBuf::from("resources/fonts/DejaVuSans.ttf"));
    candidates.push(PathBuf::from("src-tauri/resources/fonts/DejaVuSans.ttf"));

    candidates
        .into_iter()
        .find(|path| path.exists())
        .map(|path| path.to_string_lossy().to_string())
}

impl PdfContext {

    fn create(
        app: &AppHandle,
        title: &str,
        width: Mm,
        height: Mm,
    ) -> Result<Self, String> {

        let mut doc = PdfDocument::new(title);

        // =========================
        // CHARGEMENT POLICE
        // =========================

        let font_path = resolve_font_path(app)
            .ok_or("Police DejaVuSans.ttf introuvable")?;

        let font_bytes = std::fs::read(&font_path)
            .map_err(|e| {
                format!(
                    "Impossible de lire {} : {}",
                    font_path,
                    e
                )
            })?;

        let parsed_font =
            ParsedFont::from_bytes(
                &font_bytes,
                0,
                &mut Vec::new(),
            )
            .ok_or(
                "Impossible de charger la police DejaVuSans"
                    .to_string()
            )?;

        let font = doc.add_font(&parsed_font);

        Ok(Self {
            font,
            doc,
            ops: Vec::new(),
            pages: Vec::new(),

            width,
            height,

            cursor_y: height.0 - TOP_MARGIN,

            style: PdfStyle::default(),

            current_page: 1,

            header: None,
            footer: None,
        })
    }


    // =========================
    // PAYSAGE
    // =========================

    pub fn new_landscape(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::create(
            app,
            title,
            Mm(297.0),
            Mm(210.0),
        )
    }


    // =========================
    // PORTRAIT
    // =========================

    pub fn new_portrait(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::create(
            app,
            title,
            Mm(210.0),
            Mm(297.0),
        )
    }


    // =========================
    // PAR DÉFAUT
    // =========================

    pub fn new(
        app: &AppHandle,
        title: &str,
    ) -> Result<Self, String> {

        Self::new_landscape(
            app,
            title,
        )
    }

}

impl PdfContext {

    pub fn finish(&mut self) -> Result<(), String> {

        // Dernière page
        if !self.ops.is_empty() {

            // Footer dernière page
            if let Some(footer) = self.footer.clone() {
                footer.render(self)?;
            }

            let ops = std::mem::take(&mut self.ops);

            self.pages.push(
                PdfPage::new(
                    self.width,
                    self.height,
                    ops,
                )
            );
        }

        self.doc.with_pages(
            std::mem::take(&mut self.pages)
        );

        Ok(())
    }

}

// POUR AJOUTER L'IMAGE SUR LE DOCUMENT
// ====================================

impl PdfContext {

    // ============================================================
    // IMAGE
    // ============================================================

    pub fn image_fill(
        &mut self,
        path: &str,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
    ) -> Result<(), String> {
        if width <= 0.0 || height <= 0.0 {
            return Err("Dimensions de l'image invalides".into());
        }

        // ============================================================
        // LECTURE DE L'IMAGE
        // ============================================================

        let bytes = std::fs::read(path)
            .map_err(|e| {
                format!(
                    "Impossible de lire l'image '{}': {}",
                    path, e
                )
            })?;

        let raw_image = RawImage::decode_from_bytes(
            &bytes,
            &mut Vec::new(),
        )
        .map_err(|e| {
            format!(
                "Impossible de décoder l'image '{}': {:?}",
                path, e
            )
        })?;

        let image_width = raw_image.width as f32;
        let image_height = raw_image.height as f32;

        if image_width <= 0.0 || image_height <= 0.0 {
            return Err("Dimensions de l'image invalides".into());
        }

        // ============================================================
        // AJOUT DE L'IMAGE
        // ============================================================

        let image_id = self.doc.add_image(&raw_image);

        // ============================================================
        // FORCER L'IMAGE À AVOIR EXACTEMENT
        // LES DIMENSIONS DU CADRE
        // ============================================================

        let dpi = 96.0_f32;

        let image_width_mm =
            image_width * 25.4 / dpi;

        let image_height_mm =
            image_height * 25.4 / dpi;

        let scale_x =
            width / image_width_mm;

        let scale_y =
            height / image_height_mm;

        let transform = XObjectTransform {
            translate_x: Some(
                Pt::from(Mm(x))
            ),
            translate_y: Some(
                Pt::from(Mm(y))
            ),
            rotate: None,
            scale_x: Some(scale_x),
            scale_y: Some(scale_y),
            dpi: Some(dpi),
        };

        self.ops.push(Op::UseXobject {
            id: image_id,
            transform,
        });

        Ok(())
    }

    pub fn image_profile(
        &mut self,
        path: &str,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
    ) -> Result<(), String> {

        let bytes = std::fs::read(path)
            .map_err(|e| {
                format!(
                    "Impossible de lire l'image {} : {}",
                    path,
                    e
                )
            })?;

        let raw_image = RawImage::decode_from_bytes(
            &bytes,
            &mut Vec::new(),
        )
        .map_err(|e| {
            format!(
                "Impossible de décoder l'image {} : {:?}",
                path,
                e
            )
        })?;

        let image_id = self.doc.add_image(&raw_image);

        let transform = XObjectTransform {
            translate_x: Some(Pt::from(Mm(x))),
            translate_y: Some(Pt::from(Mm(y))),
            rotate: None,
            scale_x: Some(width / raw_image.width as f32),
            scale_y: Some(height / raw_image.height as f32),
            dpi: Some(96.0),
        };

        self.ops.push(
            Op::UseXobject {
                id: image_id,
                transform,
            }
        );

        Ok(())
    }

    // ========================================================
    // IMAGE AVEC PROPORTIONS CONSERVÉES
    // ========================================================

    pub fn image_contain(
        &mut self,
        path: &str,
        x: f32,
        y: f32,
        box_width: f32,
        box_height: f32,
    ) -> Result<(), String> {
        if box_width <= 0.0 || box_height <= 0.0 {
            return Err("Dimensions de la zone d'image invalides".into());
        }

        // ============================================================
        // LECTURE DE L'IMAGE
        // ============================================================

        let bytes = std::fs::read(path)
            .map_err(|e| {
                format!(
                    "Impossible de lire l'image '{}': {}",
                    path, e
                )
            })?;

        let raw_image = RawImage::decode_from_bytes(
            &bytes,
            &mut Vec::new(),
        )
        .map_err(|e| {
            format!(
                "Impossible de décoder l'image '{}': {:?}",
                path, e
            )
        })?;

        let image_width = raw_image.width as f32;
        let image_height = raw_image.height as f32;

        if image_width <= 0.0 || image_height <= 0.0 {
            return Err("Dimensions de l'image invalides".into());
        }

        // ============================================================
        // CALCUL DU RATIO POUR CONSERVER LES PROPORTIONS
        // ============================================================

        let image_ratio = image_width / image_height;
        let box_ratio = box_width / box_height;

        let (draw_width, draw_height) =
            if image_ratio > box_ratio {
                // Image plus large que le cadre
                let width = box_width;
                let height = width / image_ratio;

                (width, height)
            } else {
                // Image plus haute que le cadre
                let height = box_height;
                let width = height * image_ratio;

                (width, height)
            };

        // ============================================================
        // CENTRAGE DANS LE CADRE
        // ============================================================

        let draw_x = x + (box_width - draw_width) / 2.0;
        let draw_y = y + (box_height - draw_height) / 2.0;

        // ============================================================
        // AJOUT DE L'IMAGE AU DOCUMENT
        // ============================================================

        let image_id = self.doc.add_image(&raw_image);

        // ============================================================
        // POSITIONNEMENT
        //
        // IMPORTANT :
        // On utilise directement draw_y.
        // Pas de :
        //
        // self.height.0 - draw_y - draw_height
        //
        // car ton rectangle() utilise lui aussi directement y.
        // ============================================================

        let transform = XObjectTransform {
            translate_x: Some(Pt::from(Mm(draw_x))),
            translate_y: Some(Pt::from(Mm(draw_y))),
            rotate: None,
            scale_x: Some(draw_width / image_width),
            scale_y: Some(draw_height / image_height),
            dpi: Some(96.0),
        };

        self.ops.push(Op::UseXobject {
            id: image_id,
            transform,
        });

        Ok(())
    }

    // pub fn image_contain(
    //     &mut self,
    //     path: &str,
    //     x: f32,
    //     y: f32,
    //     box_width: f32,
    //     box_height: f32,
    // ) -> Result<(), String> {

    //     // ============================================================
    //     // VALIDATION
    //     // ============================================================

    //     if box_width <= 0.0 || box_height <= 0.0 {
    //         return Err(
    //             "Dimensions de la zone d'image invalides".into()
    //         );
    //     }

    //     // ============================================================
    //     // LECTURE DE L'IMAGE
    //     // ============================================================

    //     let bytes = std::fs::read(path)
    //         .map_err(|e| {
    //             format!(
    //                 "Impossible de lire l'image '{}': {}",
    //                 path,
    //                 e
    //             )
    //         })?;

    //     // ============================================================
    //     // DÉCODAGE
    //     // ============================================================

    //     let raw_image =
    //         RawImage::decode_from_bytes(
    //             &bytes,
    //             &mut Vec::new(),
    //         )
    //         .map_err(|e| {
    //             format!(
    //                 "Impossible de décoder l'image '{}': {:?}",
    //                 path,
    //                 e
    //             )
    //         })?;

    //     // ============================================================
    //     // DIMENSIONS
    //     // ============================================================

    //     let image_width =
    //         raw_image.width as f32;

    //     let image_height =
    //         raw_image.height as f32;

    //     if image_width <= 0.0
    //         || image_height <= 0.0
    //     {
    //         return Err(
    //             "Dimensions de l'image invalides".into()
    //         );
    //     }

    //     // ============================================================
    //     // RATIO
    //     // ============================================================

    //     let image_ratio =
    //         image_width / image_height;

    //     let box_ratio =
    //         box_width / box_height;

    //     let (draw_width, draw_height) =
    //         if image_ratio > box_ratio {

    //             // Image plus large
    //             let width = box_width;

    //             let height =
    //                 width / image_ratio;

    //             (width, height)

    //         } else {

    //             // Image plus haute
    //             let height = box_height;

    //             let width =
    //                 height * image_ratio;

    //             (width, height)
    //         };

    //     // ============================================================
    //     // CENTRAGE DANS LA ZONE
    //     // ============================================================

    //     let draw_x =
    //         x + (box_width - draw_width) / 2.0;

    //     let draw_y =
    //         y + (box_height - draw_height) / 2.0;

    //     // ============================================================
    //     // CONVERSION DU REPÈRE VERTICAL
    //     //
    //     // Le rapport travaille depuis le haut.
    //     // printpdf travaille depuis le bas.
    //     // ============================================================

    //     let pdf_y =
    //         self.height.0
    //             - draw_y
    //             - draw_height;

    //     // ============================================================
    //     // AJOUT DE L'IMAGE
    //     // ============================================================

    //     let image_id =
    //         self.doc.add_image(&raw_image);

    //     // ============================================================
    //     // DPI
    //     // ============================================================

    //     let dpi = 96.0_f32;

    //     // Conversion pixels -> mm
    //     let image_width_mm =
    //         image_width * 25.4 / dpi;

    //     let image_height_mm =
    //         image_height * 25.4 / dpi;

    //     // ============================================================
    //     // ÉCHELLE
    //     // ============================================================

    //     let scale_x =
    //         draw_width / image_width_mm;

    //     let scale_y =
    //         draw_height / image_height_mm;

    //     // ============================================================
    //     // TRANSFORMATION PDF
    //     // ============================================================

    //     let transform = XObjectTransform {

    //         translate_x: Some(
    //             Pt::from(Mm(draw_x))
    //         ),

    //         translate_y: Some(
    //             Pt::from(Mm(pdf_y))
    //         ),

    //         rotate: None,

    //         scale_x: Some(scale_x),

    //         scale_y: Some(scale_y),

    //         dpi: Some(dpi),
    //     };

    //     // ============================================================
    //     // AJOUT AUX OPÉRATIONS
    //     // ============================================================

    //     self.ops.push(
    //         Op::UseXobject {
    //             id: image_id,
    //             transform,
    //         }
    //     );

    //     Ok(())
    // }

//     pub fn image_contain(
//     &mut self,
//     path: &str,
//     x: f32,
//     y: f32,
//     box_width: f32,
//     box_height: f32,
// ) -> Result<(), String> {

//     // ============================================================
//     // LIRE L'IMAGE
//     // ============================================================

//     let bytes = std::fs::read(path)
//         .map_err(|e| {
//             format!(
//                 "Impossible de lire l'image {} : {}",
//                 path,
//                 e
//             )
//         })?;

//     // ============================================================
//     // DÉCODER L'IMAGE
//     // ============================================================

//     let raw_image =
//         RawImage::decode_from_bytes(
//             &bytes,
//             &mut Vec::new(),
//         )
//         .map_err(|e| {
//             format!(
//                 "Impossible de décoder l'image {} : {:?}",
//                 path,
//                 e
//             )
//         })?;

//     // ============================================================
//     // DIMENSIONS
//     // ============================================================

//     let image_width =
//         raw_image.width as f32;

//     let image_height =
//         raw_image.height as f32;

//     if image_width <= 0.0
//         || image_height <= 0.0
//     {
//         return Err(
//             "Dimensions de l'image invalides".into()
//         );
//     }

//     if box_width <= 0.0
//         || box_height <= 0.0
//     {
//         return Err(
//             "Dimensions de la zone d'image invalides"
//                 .into()
//         );
//     }

//     // ============================================================
//     // CALCUL DU RATIO
//     // ============================================================

//     let image_ratio =
//         image_width / image_height;

//     let box_ratio =
//         box_width / box_height;

//     let (draw_width, draw_height) =
//         if image_ratio > box_ratio {

//             // Image plus large que la zone
//             let width = box_width;
//             let height =
//                 width / image_ratio;

//             (width, height)

//         } else {

//             // Image plus haute que la zone
//             let height = box_height;
//             let width =
//                 height * image_ratio;

//             (width, height)
//         };

//     // ============================================================
//     // CENTRAGE HORIZONTAL / VERTICAL
//     // ============================================================

//     let draw_x =
//         x + (box_width - draw_width) / 2.0;

//     let draw_y =
//         y + (box_height - draw_height) / 2.0;

//     // ============================================================
//     // AJOUT DE L'IMAGE AU DOCUMENT
//     // ============================================================

//     let image_id =
//         self.doc.add_image(&raw_image);

//     // ============================================================
//     // TRANSFORMATION
//     // ============================================================

//     let transform = XObjectTransform {

//         translate_x: Some(
//             Pt::from(Mm(draw_x))
//         ),

//         translate_y: Some(
//             Pt::from(Mm(draw_y))
//         ),

//         rotate: None,

//         scale_x: Some(
//             draw_width / image_width
//         ),

//         scale_y: Some(
//             draw_height / image_height
//         ),

//         dpi: None,
//     };

//     // ============================================================
//     // AJOUT DE L'IMAGE AUX OPÉRATIONS PDF
//     // ============================================================

//     self.ops.push(
//         Op::UseXobject {
//             id: image_id,
//             transform,
//         }
//     );

//     Ok(())
// }

}

impl PdfContext {

    pub fn rectangle(
        &mut self,
        x: f32,
        y: f32,
        width: f32,
        height: f32,
    ) {

        let points = vec![
            LinePoint {
                p: Point::new(Mm(x), Mm(y)),
                bezier: false,
            },
            LinePoint {
                p: Point::new(Mm(x + width), Mm(y)),
                bezier: false,
            },
            LinePoint {
                p: Point::new(
                    Mm(x + width),
                    Mm(y + height),
                ),
                bezier: false,
            },
            LinePoint {
                p: Point::new(Mm(x), Mm(y + height)),
                bezier: false,
            },
        ];

        self.ops.push(
            Op::DrawLine {
                line: Line {
                    points,
                    is_closed: true,
                },
            }
        );
    }
}
