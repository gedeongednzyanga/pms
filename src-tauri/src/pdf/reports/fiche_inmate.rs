use crate::{models::inmate::InmateFiche, pdf::engine::{
    context::PdfContext,
    renderer::PdfReport,
    table::{TableAlign, TableColumn, TableRow},
}};


pub struct InmateFicheReport {
    pub inmate: InmateFiche,
}

impl PdfReport for InmateFicheReport {
    fn render(
        &self,
        pdf: &mut PdfContext,
    ) -> Result<(), String> {

        // ============================================================
        // EN-TÊTE
        // ============================================================

        pdf.title(
            "FICHE INDIVIDUELLE DU DÉTENU",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        pdf.text(
            &format!(
                "Référence : {}",
                self.inmate.id
            ),
            15.0,
            pdf.cursor_y,
            8.0,
        );

        pdf.move_down(10.0);

        // ============================================================
        // IDENTITÉ
        // ============================================================

        pdf.title(
            "IDENTITÉ DU DÉTENU",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        let columns = vec![
            TableColumn {
                title: "Information".into(),
                width: 55.0,
                align: TableAlign::Left,
            },
            TableColumn {
                title: "Valeur".into(),
                width: 125.0,
                align: TableAlign::Left,
            },
        ];

        pdf.table_header(
            &columns,
            15.0,
            pdf.cursor_y,
        );

        let nom_complet = format!(
            "{} {}{}",
            self.inmate.firstname,
            self.inmate
                .middlename
                .as_deref()
                .map(|v| format!(" {} ", v))
                .unwrap_or_else(|| " ".into()),
            self.inmate.lastname
        );

        let rows = vec![
            vec![
                "Nom complet".into(),
                nom_complet,
            ],
            vec![
                "Sexe".into(),
                self.inmate.sex.clone(),
            ],
            vec![
                "Date de naissance".into(),
                self.inmate.dob.clone(),
            ],
            vec![
                "État civil".into(),
                self.inmate.marital_status.clone(),
            ],
            vec![
                "Adresse".into(),
                self.inmate.address.clone(),
            ],
        ];

        for (index, row) in rows.iter().enumerate() {
            pdf.table_row(
                &TableRow {
                    values: row.clone(),
                },
                &columns,
                15.0,
                index % 2 == 0,
            );
        }

        pdf.move_down(10.0);

        // ============================================================
        // INCARCÉRATION
        // ============================================================

        pdf.title(
            "INFORMATIONS D'INCARCÉRATION",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        pdf.table_header(
            &columns,
            15.0,
            pdf.cursor_y,
        );

        let rows = vec![
            vec![
                "Prison / Cellule".into(),
                self.inmate
                    .cellule_name
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
            vec![
                "Arrêté par".into(),
                self.inmate
                    .arreter_par
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
            vec![
                "Lieu d'arrestation".into(),
                self.inmate
                    .lieu_arreter
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
            vec![
                "Date d'entrée".into(),
                self.inmate.date_from.clone(),
            ],
            vec![
                "Date de sortie".into(),
                self.inmate
                    .date_to
                    .clone()
                    .unwrap_or_else(|| "En détention".into()),
            ],
        ];

        for (index, row) in rows.iter().enumerate() {
            pdf.table_row(
                &TableRow {
                    values: row.clone(),
                },
                &columns,
                15.0,
                index % 2 == 0,
            );
        }

        pdf.move_down(10.0);

        // ============================================================
        // CONTACT D'URGENCE
        // ============================================================

        pdf.title(
            "CONTACT D'URGENCE",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        pdf.table_header(
            &columns,
            15.0,
            pdf.cursor_y,
        );

        let rows = vec![
            vec![
                "Nom".into(),
                self.inmate
                    .emergency_name
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
            vec![
                "Relation".into(),
                self.inmate
                    .emergency_relation
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
            vec![
                "Contact".into(),
                self.inmate
                    .emergency_contact
                    .clone()
                    .unwrap_or_else(|| "-".into()),
            ],
        ];

        for (index, row) in rows.iter().enumerate() {
            pdf.table_row(
                &TableRow {
                    values: row.clone(),
                },
                &columns,
                15.0,
                index % 2 == 0,
            );
        }

        pdf.move_down(10.0);

        // ============================================================
        // PIED
        // ============================================================

        pdf.text(
            "Fiche générée automatiquement par le système de gestion pénitentiaire",
            15.0,
            pdf.cursor_y,
            7.0,
        );

        Ok(())
    }
}