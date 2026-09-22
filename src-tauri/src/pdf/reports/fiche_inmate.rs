use crate::{
    models::inmate::InmateFiche,
    pdf::engine::{
        context::PdfContext,
        renderer::PdfReport,
    },
};

pub struct InmateFicheReport {
    pub inmate: InmateFiche,
}

impl PdfReport for InmateFicheReport {

    fn render(
        &self,
        pdf: &mut PdfContext,
    ) -> Result<(), String> {

        // ============================================================
        // CONSTANTES DE MISE EN PAGE
        // ============================================================

        let left = 15.0;
        let right = 195.0;
        let page_width = 180.0;

        // ============================================================
        // NOM COMPLET
        // ============================================================

        let nom_complet = format!(
            "{}{} {}",
            self.inmate.firstname,
            self.inmate
                .middlename
                .as_deref()
                .map(|v| format!(" {}", v))
                .unwrap_or_default(),
            self.inmate.lastname
        );

        // ============================================================
        // STATUT
        // ============================================================

        let statut = if self.inmate.date_to.is_some() {
            "SORTI"
        } else {
            "EN DÉTENTION"
        };

        // ============================================================
        // TITRE
        // ============================================================

        pdf.title(
            "FICHE INDIVIDUELLE DU DÉTENU",
            left,
            pdf.cursor_y,
        );

        pdf.move_down(6.0);

        pdf.text(
            "Dossier individuel — Gestion pénitentiaire",
            left,
            pdf.cursor_y,
            8.0,
        );

        pdf.move_down(5.0);

        // ============================================================
        // BANDEAU DOSSIER
        // ============================================================

        let dossier_y = pdf.cursor_y - 4.0;

        pdf.rectangle(
            left,
            dossier_y - 8.0,
            page_width,
            12.0,
        );

        pdf.text(
            &format!(
                "DOSSIER N° : {}",
                self.inmate.id
            ),
            left + 4.0,
            dossier_y,
            8.0,
        );

        pdf.text(
            &format!(
                "STATUT : {}",
                statut
            ),
            130.0,
            dossier_y,
            8.0,
        );

        pdf.move_down(18.0);

        // ============================================================
        // ZONE IDENTITÉ
        // ============================================================

        let identity_top = pdf.cursor_y;

        // ------------------------------------------------------------
        // PHOTO
        // ------------------------------------------------------------

        let photo_x = left;
        let photo_y = identity_top - 45.0;

        let photo_width = 35.0;
        let photo_height = 45.0;

        // Cadre photo
        pdf.rectangle(
            photo_x,
            photo_y,
            photo_width,
            photo_height,
        );

        // Photo
        if let Some(photo_path) =
            &self.inmate.photo_path
        {
            if !photo_path.trim().is_empty() {

                pdf.image_fill(
                    photo_path,
                    photo_x,
                    photo_y,
                    photo_width,
                    photo_height,
                )
                .map_err(|e| {
                    format!(
                        "Erreur affichage photo du détenu : {}",
                        e
                    )
                })?;
            }
        }
        
        // ------------------------------------------------------------
        // INFORMATIONS IDENTITÉ
        // ------------------------------------------------------------

        let info_x = 58.0;

        pdf.text(
            "IDENTITÉ DU DÉTENU",
            info_x,
            identity_top,
            10.0,
        );

        pdf.line(
            info_x,
            identity_top - 3.0,
            right,
            identity_top - 3.0,
        );

        // Nom complet
        pdf.text(
            "Nom complet",
            info_x,
            identity_top - 10.0,
            7.0,
        );

        pdf.text(
            &nom_complet,
            info_x,
            identity_top - 16.0,
            10.0,
        );

        // Sexe
        pdf.text(
            "Sexe",
            info_x,
            identity_top - 25.0,
            7.0,
        );

        pdf.text(
            &self.inmate.sex,
            info_x,
            identity_top - 31.0,
            9.0,
        );

        // Date de naissance
        pdf.text(
            "Date de naissance",
            115.0,
            identity_top - 25.0,
            7.0,
        );

        pdf.text(
            &self.inmate.dob,
            115.0,
            identity_top - 31.0,
            9.0,
        );

        // État civil
        pdf.text(
            "État civil",
            info_x,
            identity_top - 39.0,
            7.0,
        );

        pdf.text(
            &self.inmate.marital_status,
            info_x,
            identity_top - 45.0,
            9.0,
        );

        // Adresse
        pdf.text(
            "Adresse",
            115.0,
            identity_top - 39.0,
            7.0,
        );

        pdf.text(
            &self.inmate.address,
            115.0,
            identity_top - 45.0,
            8.0,
        );

        pdf.move_down(55.0);

        // ============================================================
        // INFORMATIONS D'INCARCÉRATION
        // ============================================================

        let incarceration_top =
            pdf.cursor_y;

        pdf.title(
            "INFORMATIONS D'INCARCÉRATION",
            left,
            incarceration_top,
        );

        pdf.move_down(6.0);

        // Cadre
        let box_top = pdf.cursor_y;

        pdf.rectangle(
            left,
            box_top - 43.0,
            page_width,
            45.0,
        );

        // Colonne gauche
        pdf.text(
            "PRISON / CELLULE",
            left + 4.0,
            box_top - 8.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .cellule_name
                .clone()
                .unwrap_or_else(|| "-".into()),
            left + 4.0,
            box_top - 14.0,
            9.0,
        );

        pdf.text(
            "ARRÊTÉ PAR",
            left + 4.0,
            box_top - 23.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .arreter_par
                .clone()
                .unwrap_or_else(|| "-".into()),
            left + 4.0,
            box_top - 29.0,
            9.0,
        );

        // Colonne droite
        pdf.text(
            "DATE D'ENTRÉE",
            110.0,
            box_top - 8.0,
            7.0,
        );

        pdf.text(
            &self.inmate.date_from,
            110.0,
            box_top - 14.0,
            9.0,
        );

        pdf.text(
            "DATE DE SORTIE",
            110.0,
            box_top - 23.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .date_to
                .clone()
                .unwrap_or_else(|| {
                    "En détention".into()
                }),
            110.0,
            box_top - 29.0,
            9.0,
        );

        // Ligne lieu arrestation
        pdf.line(
            left + 3.0,
            box_top - 34.0,
            right - 3.0,
            box_top - 34.0,
        );

        pdf.text(
            "LIEU D'ARRESTATION",
            left + 4.0,
            box_top - 39.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .lieu_arreter
                .clone()
                .unwrap_or_else(|| "-".into()),
            65.0,
            box_top - 39.0,
            8.0,
        );

        pdf.move_down(50.0);

        // ============================================================
        // CONTACT D'URGENCE
        // ============================================================

        let emergency_top =
            pdf.cursor_y;

        pdf.title(
            "CONTACT D'URGENCE",
            left,
            emergency_top,
        );

        pdf.move_down(6.0);

        let emergency_box_top =
            pdf.cursor_y;

        pdf.rectangle(
            left,
            emergency_box_top - 30.0,
            page_width,
            32.0,
        );

        // Nom
        pdf.text(
            "NOM",
            left + 4.0,
            emergency_box_top - 9.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .emergency_name
                .clone()
                .unwrap_or_else(|| "-".into()),
            left + 4.0,
            emergency_box_top - 15.0,
            9.0,
        );

        // Relation
        pdf.text(
            "RELATION",
            85.0,
            emergency_box_top - 9.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .emergency_relation
                .clone()
                .unwrap_or_else(|| "-".into()),
            85.0,
            emergency_box_top - 15.0,
            9.0,
        );

        // Contact
        pdf.text(
            "CONTACT",
            140.0,
            emergency_box_top - 9.0,
            7.0,
        );

        pdf.text(
            &self.inmate
                .emergency_contact
                .clone()
                .unwrap_or_else(|| "-".into()),
            140.0,
            emergency_box_top - 15.0,
            9.0,
        );

        pdf.move_down(38.0);

        // ============================================================
        // OBSERVATIONS
        // ============================================================

        let observation_top =
            pdf.cursor_y;

        pdf.title(
            "OBSERVATIONS",
            left,
            observation_top,
        );

        pdf.move_down(6.0);

        let observation_box_top =
            pdf.cursor_y;

        pdf.rectangle(
            left,
            observation_box_top - 25.0,
            page_width,
            25.0,
        );

        pdf.move_down(43.0);

        // ============================================================
        // SIGNATURE
        // ============================================================

        let signature_top =
            pdf.cursor_y;

        pdf.text(
            "AGENT RESPONSABLE",
            left,
            signature_top,
            7.0,
        );

        pdf.text(
            "SIGNATURE",
            130.0,
            signature_top,
            7.0,
        );

        pdf.line(
            left,
            signature_top - 18.0,
            85.0,
            signature_top - 18.0,
        );

        pdf.line(
            130.0,
            signature_top - 18.0,
            right,
            signature_top - 18.0,
        );

        // ============================================================
        // PIED DE FICHE
        // ============================================================

        pdf.move_down(25.0);

        pdf.line(
            left,
            pdf.cursor_y,
            right,
            pdf.cursor_y,
        );

        pdf.move_down(5.0);

        pdf.text(
            "Document généré automatiquement par le système de gestion pénitentiaire.",
            left,
            pdf.cursor_y,
            6.5,
        );

        Ok(())
    }
}