use printpdf::*;
use super::context::PdfContext;

// =========================
// ALIGNEMENT COLONNE
// =========================

#[derive(Clone)]
pub enum TableAlign {
    Left,
    Center,

    Right,
}


// =========================
// COLONNE TABLEAU
// =========================

#[derive(Clone)]
pub struct TableColumn {

    pub title: String,
    pub width: f32,
    pub align: TableAlign,

}

// =========================
// LIGNE TABLEAU
// =========================

pub struct TableRow {
    pub values: Vec<String>,
}

// fonction de calcul de position du texte
fn calculate_text_x(

    start_x: f32,
    width: f32,
    text: &str,
    align: &TableAlign,

) -> f32 {

    let estimated_width =
        text.len() as f32 * 2.5;

    match align {
        TableAlign::Left => {
            start_x + 2.0
        },

        TableAlign::Center => {
            start_x +
            ((width - estimated_width) / 2.0)
        },

        TableAlign::Right => {
            start_x +
            width -
            estimated_width -
            2.0
        },
    }
}

fn scaled_widths(
    columns: &[TableColumn],
    total_width: f32,
) -> Vec<f32> {
    let raw_total: f32 = columns.iter().map(|column| column.width).sum();

    if raw_total <= 0.0 {
        let width = if columns.is_empty() {
            0.0
        } else {
            total_width / columns.len() as f32
        };

        return vec![width; columns.len()];
    }

    let scale = total_width / raw_total;
    columns.iter().map(|column| column.width * scale).collect()
}


// Implémentation du tableau
impl PdfContext {

    pub fn table_header(
        &mut self,
        columns: &[TableColumn],
        x: f32,
        y: f32,
    ) {
        let mut current_x = x;

        let available_width =
            self.width.0 - x - 15.0;

        let widths =
            scaled_widths(columns, available_width);

        for (index, column) in columns.iter().enumerate() {

            let width = widths[index];

            self.rect(
                current_x,
                y,
                width,
                8.0,

                Some(
                    Color::Rgb(
                        Rgb::new(
                            0.85,
                            0.85,
                            0.85,
                            None,
                        )
                    )
                ),

                Some(
                    self.style.border_color.clone()
                ),
            );

            let text_x = calculate_text_x(
                current_x,
                width,
                &column.title,
                &column.align,
            );

            self.text(
                &column.title,
                text_x,
                y - 5.5,
                9.0,
            );

            current_x += width;
        }

        self.move_down(8.0);
    }

    // pub fn table_header(

    //     &mut self,
    //     columns: &[TableColumn],
    //     x: f32,
    //     y: f32,

    // ) {

    //     let mut current_x = x;
    //     let available_width = self.width.0 - x - 15.0;
    //     let widths = scaled_widths(columns, available_width);

    //     for (index, column) in columns.iter().enumerate() {
    //         let width = widths[index];
    //         self.rect(
    //             current_x,
    //             y,
    //             width,
    //             8.0,

    //             Some(
    //                 Color::Rgb(
    //                     Rgb::new(
    //                         0.85,
    //                         0.85,
    //                         0.85,
    //                         None
    //                     )
    //                 )
    //             ),

    //             Some(
    //                 self.style.border_color.clone()
    //             ),
    //         );

    //         // let text_x =
    //         //     calculate_text_x(
    //         //         current_x,
    //         //         width,
    //         //         &column.title,
    //         //         &TableAlign::Center,
    //         //     );
    //         let text_x = calculate_text_x(
    //             current_x,
    //             width,
    //             &column.title,
    //             &column.align,
    //         );


    //         self.text(
    //             &column.title,
    //             text_x,
    //             y - 5.5,
    //             9.0,
    //             // font,
    //         );

    //         current_x += width;
    //     }

    //     self.move_down(8.0);

    // }

}

// Dessiner une ligne du tableau
impl PdfContext {


    pub fn table_row(
        &mut self,
        row: &TableRow,
        columns: &[TableColumn],
        x: f32,
        alternate: bool,

    ) {

        let height = 8.0;
        self.check_space(height);

        let background = if alternate {
            Color::Rgb(
                Rgb::new(
                    0.96,
                    0.96,
                    0.96,
                    None
                )
            )
        } else {

            Color::Rgb(
                Rgb::new(
                    1.0,
                    1.0,
                    1.0,
                    None
                )
            )
        };

        let mut current_x = x;
        let available_width = self.width.0 - x - 15.0;
        let widths = scaled_widths(columns, available_width);
        for (index, value) in row.values.iter().enumerate() {
            let column = &columns[index];
            let width = widths[index];
            self.rect(
                current_x,
                self.cursor_y,
                width,
                height,
                Some(background.clone()),
                Some(
                    self.style.border_color.clone()
                ),
            );

            // self.text(
            //     value,
            //     current_x + 2.0,
            //     self.cursor_y - 5.5,
            //     9.0,
            //     font,
            // );
            let text_x =
                calculate_text_x(
                    current_x,
                    width,
                    value,
                    &column.align,
                );


            self.text(
                value,
                text_x,
                self.cursor_y - 5.5,
                9.0,
                // font,
            );

            current_x += width;

        }

        self.move_down(height);
    }

}

impl Default for TableAlign {

    fn default() -> Self {

        TableAlign::Left

    }

}
