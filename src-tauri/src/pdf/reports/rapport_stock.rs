use crate::pdf::engine::{
    context::PdfContext,
    renderer::PdfReport,
    table::{TableAlign, TableColumn, TableRow},
};

use crate::models::rapport::{
    ArticleStockCritique,
    MouvementSerie,
    RapportCategorie,
    RapportKpis,
    TopFournisseur,
};

pub struct RapportStockReport {
    pub nom_depot: String,
    pub date_debut: String,
    pub date_fin: String,

    pub kpis: RapportKpis,

    pub mouvements: Vec<MouvementSerie>,

    pub categories: Vec<RapportCategorie>,

    pub fournisseurs: Vec<TopFournisseur>,

    pub articles_critiques: Vec<ArticleStockCritique>,
}

impl RapportStockReport {

    fn format_nombre(value: f64) -> String {
        if value.fract() == 0.0 {
            format!("{:.0}", value)
        } else {
            format!("{:.2}", value)
        }
    }

    fn format_pourcentage(value: f64) -> String {
        format!("{:.2} %", value)
    }

    fn format_periode(&self) -> String {
        if self.date_debut == self.date_fin {
            self.date_debut.clone()
        } else {
            format!(
                "{} au {}",
                self.date_debut,
                self.date_fin
            )
        }
    }
}


impl PdfReport for RapportStockReport {

    fn render(
        &self,
        pdf: &mut PdfContext,
    ) -> Result<(), String> {

        // ============================================================
        // EN-TÊTE
        // ============================================================

        pdf.title(
            &self.nom_depot,
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        pdf.title(
            "RAPPORT D'ACTIVITE DU STOCK",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);

        pdf.text(
            &format!(
                "Période : {}",
                self.format_periode()
            ),
            15.0,
            pdf.cursor_y,
            9.0,
        );

        pdf.move_down(5.0);

        pdf.text(
            "Synthèse des mouvements, stocks et approvisionnements",
            15.0,
            pdf.cursor_y,
            8.0,
        );

        pdf.move_down(10.0);


        // ============================================================
        // KPI
        // ============================================================

        pdf.title(
            "INDICATEURS CLÉS",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);


        let kpi_columns = vec![

            TableColumn {
                title: "Indicateur".into(),
                width: 55.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Valeur".into(),
                width: 35.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Indicateur".into(),
                width: 55.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Valeur".into(),
                width: 35.0,
                align: TableAlign::Center,
            },
        ];


        pdf.table_header(
            &kpi_columns,
            15.0,
            pdf.cursor_y,
        );


        let kpi_rows = vec![

            vec![
                "Articles".to_string(),
                self.kpis.total_articles.to_string(),
                "Stock global".to_string(),
                Self::format_nombre(
                    self.kpis.stock_global
                ),
            ],

            vec![
                "Stock faible".to_string(),
                self.kpis.stock_faible.to_string(),
                "Ruptures".to_string(),
                self.kpis.ruptures.to_string(),
            ],

            vec![
                "Réceptions".to_string(),
                self.kpis.receptions.to_string(),
                "Approvisionnements".to_string(),
                self.kpis.approvisionnements.to_string(),
            ],

            vec![
                "Entrées".to_string(),
                Self::format_nombre(
                    self.kpis.entrees
                ),
                "Sorties".to_string(),
                Self::format_nombre(
                    self.kpis.sorties
                ),
            ],
        ];


        for (index, row) in kpi_rows.iter().enumerate() {

            pdf.table_row(
                &TableRow {
                    values: row.clone(),
                },
                &kpi_columns,
                15.0,
                index % 2 == 0,
            );
        }


        pdf.move_down(10.0);


        // ============================================================
        // ACTIVITÉ DES MOUVEMENTS
        // ============================================================

        pdf.title(
            "ACTIVITÉ DES MOUVEMENTS",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);


        let mouvement_columns = vec![

            TableColumn {
                title: "Date".into(),
                width: 35.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Entrées".into(),
                width: 45.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Sorties".into(),
                width: 45.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Solde".into(),
                width: 45.0,
                align: TableAlign::Center,
            },
        ];


        pdf.table_header(
            &mouvement_columns,
            15.0,
            pdf.cursor_y,
        );


        for (index, mouvement) in
            self.mouvements.iter().enumerate()
        {

            let solde =
                mouvement.entrees
                - mouvement.sorties;


            let row = vec![

                mouvement.jour.clone(),

                Self::format_nombre(
                    mouvement.entrees
                ),

                Self::format_nombre(
                    mouvement.sorties
                ),

                Self::format_nombre(
                    solde
                ),
            ];


            pdf.table_row(
                &TableRow {
                    values: row,
                },
                &mouvement_columns,
                15.0,
                index % 2 == 0,
            );
        }


        pdf.move_down(10.0);


        // ============================================================
        // CATÉGORIES
        // ============================================================

        pdf.title(
            "RÉPARTITION PAR CATÉGORIE",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);


        let categorie_columns = vec![

            TableColumn {
                title: "Catégorie".into(),
                width: 65.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Articles".into(),
                width: 35.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Stock".into(),
                width: 40.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Part".into(),
                width: 30.0,
                align: TableAlign::Center,
            },
        ];


        pdf.table_header(
            &categorie_columns,
            15.0,
            pdf.cursor_y,
        );


        for (index, categorie) in
            self.categories.iter().enumerate()
        {

            let row = vec![

                categorie.designation_cat.clone(),

                categorie.articles.to_string(),

                Self::format_nombre(
                    categorie.stock_global
                ),

                Self::format_pourcentage(
                    categorie.part
                ),
            ];


            pdf.table_row(
                &TableRow {
                    values: row,
                },
                &categorie_columns,
                15.0,
                index % 2 == 0,
            );
        }


        pdf.move_down(10.0);


        // ============================================================
        // TOP FOURNISSEURS
        // ============================================================

        pdf.title(
            "TOP FOURNISSEURS",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);


        let fournisseur_columns = vec![

            TableColumn {
                title: "Fournisseur".into(),
                width: 70.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Articles".into(),
                width: 35.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Quantité reçue".into(),
                width: 65.0,
                align: TableAlign::Center,
            },
        ];


        pdf.table_header(
            &fournisseur_columns,
            15.0,
            pdf.cursor_y,
        );


        if self.fournisseurs.is_empty() {

            pdf.table_row(
                &TableRow {
                    values: vec![
                        "Aucun fournisseur sur cette période"
                            .into(),
                        "-".into(),
                        "-".into(),
                    ],
                },
                &fournisseur_columns,
                15.0,
                true,
            );

        } else {

            for (index, fournisseur) in
                self.fournisseurs.iter().enumerate()
            {

                let row = vec![

                    fournisseur.nom.clone(),

                    fournisseur.articles.to_string(),

                    Self::format_nombre(
                        fournisseur.quantite
                    ),
                ];


                pdf.table_row(
                    &TableRow {
                        values: row,
                    },
                    &fournisseur_columns,
                    15.0,
                    index % 2 == 0,
                );
            }
        }


        pdf.move_down(10.0);


        // ============================================================
        // ARTICLES CRITIQUES
        // ============================================================

        pdf.title(
            "ARTICLES EN STOCK CRITIQUE",
            15.0,
            pdf.cursor_y,
        );

        pdf.move_down(7.0);


        let critique_columns = vec![

            TableColumn {
                title: "Référence".into(),
                width: 32.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Désignation".into(),
                width: 65.0,
                align: TableAlign::Left,
            },

            TableColumn {
                title: "Stock".into(),
                width: 25.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Minimum".into(),
                width: 30.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Emplacement".into(),
                width: 30.0,
                align: TableAlign::Center,
            },

            TableColumn {
                title: "Statut".into(),
                width: 30.0,
                align: TableAlign::Center,
            },
        ];


        pdf.table_header(
            &critique_columns,
            15.0,
            pdf.cursor_y,
        );


        if self.articles_critiques.is_empty() {

            pdf.table_row(
                &TableRow {
                    values: vec![
                        "-".into(),
                        "Aucun article critique".into(),
                        "-".into(),
                        "-".into(),
                        "-".into(),
                        "OK".into(),
                    ],
                },
                &critique_columns,
                15.0,
                true,
            );

        } else {

            for (index, article) in
                self.articles_critiques.iter().enumerate()
            {

                let row = vec![

                    article.reference.clone(),

                    article.designation.clone(),

                    Self::format_nombre(
                        article.stock_global
                    ),

                    Self::format_nombre(
                        article.stock_minimum
                    ),

                    article
                        .emplacement
                        .clone()
                        .unwrap_or_else(
                            || "-".into()
                        ),

                    article.statut.clone(),
                ];


                pdf.table_row(
                    &TableRow {
                        values: row,
                    },
                    &critique_columns,
                    15.0,
                    index % 2 == 0,
                );
            }
        }


        pdf.move_down(10.0);


        // ============================================================
        // PIED DE RAPPORT
        // ============================================================

        pdf.text(
            "Rapport généré automatiquement par JASPE SOFT",
            15.0,
            pdf.cursor_y,
            7.0,
        );


        Ok(())
    }
}