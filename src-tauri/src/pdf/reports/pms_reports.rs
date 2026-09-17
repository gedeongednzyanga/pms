use crate::pdf::engine::{
    context::PdfContext,
    renderer::PdfReport,
    table::{TableAlign, TableColumn, TableRow},
};

pub struct PmsListReport {
    pub title: String,
    pub description: String,
    pub columns: Vec<TableColumn>,
    pub rows: Vec<Vec<String>>,
    pub empty_message: String,
}

impl PdfReport for PmsListReport {
    fn render(&self, pdf: &mut PdfContext) -> Result<(), String> {
        pdf.title(&self.title, 15.0, pdf.cursor_y);
        pdf.move_down(7.0);
        pdf.text(&self.description, 15.0, pdf.cursor_y, 9.0);
        pdf.move_down(5.0);
        pdf.text(
            &format!("Nombre d'enregistrements : {}", self.rows.len()),
            15.0,
            pdf.cursor_y,
            8.0,
        );
        pdf.move_down(10.0);

        pdf.table_header(&self.columns, 15.0, pdf.cursor_y);

        if self.rows.is_empty() {
            let mut values = vec![self.empty_message.clone()];
            values.resize(self.columns.len(), String::new());
            pdf.table_row(&TableRow { values }, &self.columns, 15.0, true);
            return Ok(());
        }

        for (index, values) in self.rows.iter().enumerate() {
            pdf.table_row(
                &TableRow {
                    values: values.clone(),
                },
                &self.columns,
                15.0,
                index % 2 == 0,
            );
        }

        Ok(())
    }
}

pub fn left_column(title: &str, width: f32) -> TableColumn {
    TableColumn {
        title: title.into(),
        width,
        align: TableAlign::Left,
    }
}

pub fn centered_column(title: &str, width: f32) -> TableColumn {
    TableColumn {
        title: title.into(),
        width,
        align: TableAlign::Center,
    }
}
