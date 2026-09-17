// Ce fichier va contenir les fonctions utilitaires communes utilisées par tous les rapports.

use chrono::NaiveDate;

// =============================
// FORMAT DATE
// =============================

pub fn format_date(
    date: NaiveDate,
) -> String {

    date.format("%d/%m/%Y")
        .to_string()

}

// =============================
// FORMAT MONTANT
// =============================

pub fn format_currency(
    amount: f64,
) -> String {

    let formatted = format!("{:.2}", amount);

    let parts = formatted
        .split('.')
        .collect::<Vec<&str>>();

    let integer = parts[0];

    let decimal = parts[1];


    let mut result = String::new();


    for (index, c) in integer.chars().rev().enumerate() {

        if index > 0 && index % 3 == 0 {

            result.insert(
                0,
                ' '
            );

        }

        result.insert(
            0,
            c
        );

    }

    format!(
        "{}.{} $",
        result,
        decimal
    )

}

// =============================
// CENTRAGE TEXTE SIMPLE
// =============================

pub fn center_x(
    page_width: f32,
    text_width: f32,
) -> f32 {

    (page_width - text_width) / 2.0
}

// =============================
// LIMITE TEXTE
// =============================

pub fn truncate(
    text: &str,
    max: usize,
) -> String {

    if text.len() <= max {

        text.to_string()

    } else {

        format!(
            "{}...",
            &text[..max]
        )

    }

}