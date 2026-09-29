use std::path::PathBuf;

use chrono::Local;
use tauri::{AppHandle, Manager, State};

use crate::{
    db::{movements, reports::{self, get_inmate_for_fiche}}, pdf::{
        engine::{document::get_pdf_directory, renderer::{PdfRenderer, PdfReport}}, layouts::{footer::PdfFooter, header::PdfHeader}, reports::{fiche_inmate::InmateFicheReport, pms_reports::{PmsListReport, centered_column, left_column}},
    }, state::AppState,
};

fn resolve_logo_path(app: &AppHandle) -> Option<String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("resources/images/logo_pms.png"));
        candidates.push(resource_dir.join("images/logo_pms.png"));
    }

    candidates.push(PathBuf::from("resources/images/logo_pms.png"));
    candidates.push(PathBuf::from("src-tauri/resources/images/logo_pms.png"));

    candidates
        .into_iter()
        .find(|path| path.exists())
        .map(|path| path.to_string_lossy().to_string())
}

fn build_header(app: &AppHandle) -> PdfHeader {
    PdfHeader {
        school_name: "".into(), // à remplacer par le nom de ta structure
        address: "".into(),
        phone: "".into(),
        email: "".into(),
        logo: resolve_logo_path(app),
    }
}

fn build_footer() -> PdfFooter {
    PdfFooter {
        company_name: "DSR HQ".into(),
        generated_date: Local::now().format("%d/%m/%Y").to_string(),
        show_page_number: true,
    }
}

fn save_report<R: PdfReport>(
    app: &AppHandle,
    window_title: &str,
    file_prefix: &str,
    report: R,
) -> Result<String, String> {
    let mut renderer = PdfRenderer::new_landscape(app, window_title)?;
    renderer.pdf.set_layout(build_header(app), build_footer());
    renderer.render(report)?;

    let filename = format!(
        "{}_{}.pdf",
        file_prefix,
        Local::now().format("%Y%m%d_%H%M%S")
    );
    let path = get_pdf_directory(app)?.join(filename);
    renderer.save(&path)?; // consomme le renderer, c'est voulu

    Ok(path.to_string_lossy().to_string())
}

fn validate_date_range(
    date_debut: &str,
    date_fin: &str,
) -> Result<(), String> {
    let date_debut = date_debut.trim();
    let date_fin = date_fin.trim();

    if date_debut.is_empty() {
        return Err("La date de début est obligatoire.".into());
    }

    if date_fin.is_empty() {
        return Err("La date de fin est obligatoire.".into());
    }

    if date_debut > date_fin {
        return Err(
            "La date de début ne peut pas être supérieure à la date de fin."
                .into(),
        );
    }

    Ok(())
}

#[tauri::command]
pub async fn export_prisoners_report_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let prisoners = reports::get_prisoners_report_rows(&state.db).await?;
    let rows = prisoners
        .iter()
        .enumerate()
        .map(|(index, prisoner)| {
            vec![
                (index + 1).to_string(),
                prisoner.full_name.clone(),
                prisoner.sex.clone(),
                prisoner.dob.clone(),
                prisoner.marital_status.clone(),
                prisoner.cellule.clone(),
                prisoner.address.clone(),
            ]
        })
        .collect();

    save_report(
        &app,
        "Liste des détenues",
        "liste_detenues",
        PmsListReport {
            title: "LISTE DES DÉTENUES".into(),
            description: "Détenues actuellement enregistrées dans les cellules.".into(),
            columns: vec![
                centered_column("N°", 10.0),
                left_column("Nom complet", 42.0),
                centered_column("Sexe", 17.0),
                centered_column("Naissance", 28.0),
                left_column("État civil", 28.0),
                left_column("Prison / cellule", 50.0),
                left_column("Adresse", 45.0),
            ],
            rows,
            empty_message: "Aucune détenue enregistrée".into(),
        },
    )
}

#[tauri::command]
pub async fn export_transfers_report_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
    date_debut: String,
    date_fin: String,
) -> Result<String, String> {

    validate_date_range(&date_debut, &date_fin)?;

    let transfers = movements::get_transfers_by_date_range(
        &state.db,
        &date_debut,
        &date_fin,
    )
    .await?;

    let rows = transfers
        .iter()
        .enumerate()
        .map(|(index, transfer)| {
            vec![
                (index + 1).to_string(),
                transfer.inmate_name.clone(),
                transfer.transfer_date.clone(),
                transfer.from_cellule_name.clone(),
                transfer.to_cellule_name.clone(),
                transfer.reason.clone(),
            ]
        })
        .collect();

    save_report(
        &app,
        "Liste des transferts",
        "liste_transferts",
        PmsListReport {
            title: "LISTE DES TRANSFERTS".into(),

            description: format!(
                "Historique des transferts du {} au {}.",
                date_debut,
                date_fin
            ),

            columns: vec![
                centered_column("N°", 10.0),
                left_column("Détenue", 45.0),
                centered_column("Date", 28.0),
                left_column("Origine", 52.0),
                left_column("Destination", 52.0),
                left_column("Motif", 48.0),
            ],

            rows,

            empty_message: "Aucun transfert enregistré pour cette période."
                .into(),
        },
    )
}

#[tauri::command]
pub async fn export_releases_report_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
    date_debut: String,
    date_fin: String,
) -> Result<String, String> {

    validate_date_range(&date_debut, &date_fin)?;

    let releases = movements::get_releases_by_date_range(
        &state.db,
        &date_debut,
        &date_fin,
    )
    .await?;

    let rows = releases
        .iter()
        .enumerate()
        .map(|(index, release)| {
            vec![
                (index + 1).to_string(),
                release.inmate_name.clone(),
                release.release_date.clone(),
                release.reason.clone(),
                release
                    .notes
                    .clone()
                    .unwrap_or_else(|| "—".into()),
            ]
        })
        .collect();

    save_report(
        &app,
        "Liste des libérations",
        "liste_liberations",
        PmsListReport {
            title: "LISTE DES LIBÉRATIONS".into(),

            description: format!(
                "Historique des libérations du {} au {}.",
                date_debut,
                date_fin
            ),

            columns: vec![
                centered_column("N°", 10.0),
                left_column("Détenue", 52.0),
                centered_column("Date", 30.0),
                left_column("Motif", 70.0),
                left_column("Notes", 70.0),
            ],

            rows,

            empty_message:
                "Aucune libération enregistrée pour cette période."
                    .into(),
        },
    )
}


fn format_statut_plainte(statut: &str) -> String {
    match statut {
        "ENREGISTREE" => "Enregistrée".to_string(),
        "EN_COURS" => "En cours".to_string(),
        "TRANSMISE" => "Transmise".to_string(),
        "CLASSEE" => "Classée".to_string(),
        "CLOTUREE" => "Clôturée".to_string(),
        _ => statut.to_string(),
    }
}

#[tauri::command]
pub async fn export_plaintes_report_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
    date_debut: String,
    date_fin: String,
) -> Result<String, String> {

    validate_date_range(&date_debut, &date_fin)?;

    let plaintes =
        reports::get_plaintes_report_rows_by_date_range(
            &state.db,
            &date_debut,
            &date_fin,
        )
        .await?;

    let rows = plaintes
        .iter()
        .enumerate()
        .map(|(index, plainte)| {
            vec![
                (index + 1).to_string(),
                plainte.objet.clone(),
                plainte.date_faits.clone(),
                plainte.lieu_faits.clone(),
                format_statut_plainte(&plainte.statut),
                plainte.description.clone(),
            ]
        })
        .collect();

    save_report(
        &app,
        "Liste des plaintes",
        "liste_plaintes",
        PmsListReport {
            title: "LISTE DES PLAINTES".into(),

            description: format!(
                "Plaintes enregistrées du {} au {}.",
                date_debut,
                date_fin
            ),

            columns: vec![
                centered_column("N°", 9.0),
                left_column("Objet", 42.0),
                centered_column("Date", 27.0),
                left_column("Lieu des faits", 42.0),
                centered_column("Statut", 32.0),
                left_column("Description", 78.0),
            ],

            rows,

            empty_message:
                "Aucune plainte enregistrée pour cette période."
                    .into(),
        },
    )
}

#[tauri::command]
pub async fn export_inmate_fiche_pdf(
    app: AppHandle,
    state: State<'_, AppState>,
    inmate_id: String,
) -> Result<String, String> {
    let inmate = get_inmate_for_fiche(&state.db, &inmate_id)
        .await
        .map_err(|e| format!("Erreur récupération détenu : {}", e))?;

    let mut renderer = PdfRenderer::new_portrait(&app, "Fiche détenu")?;
    renderer.pdf.without_layout();

    renderer.render(InmateFicheReport { inmate })?;

    let filename = format!(
        "fiche_detenu_{}_{}.pdf",
        inmate_id,
        Local::now().format("%Y%m%d_%H%M%S"),
    );
    let path = get_pdf_directory(&app)?.join(filename);
    renderer.save(&path)?;

    Ok(path.to_string_lossy().to_string())
}