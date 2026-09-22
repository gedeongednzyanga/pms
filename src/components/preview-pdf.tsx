
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";


interface Props {
    file:string;
}


export default function PdfPreview({file}:Props){

    const [url,setUrl] = useState<string>("");

    useEffect(()=>{

        const loadPdf = async()=>{
            try {
                
                const base64 = await invoke<string>(
                    "read_pdf_file",
                    {
                        path:file
                    }
                );

                const byteCharacters = atob(base64);

                const byteNumbers = new Array(
                    byteCharacters.length
                );


                for(let i=0;i<byteCharacters.length;i++){
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const blob = new Blob(
                    [
                        new Uint8Array(byteNumbers)
                    ],
                    {
                        type:"application/pdf"
                    }
                );

                setUrl(
                    URL.createObjectURL(blob)
                );

            } catch (error) {
                toast.error("Erreur : "+ error);
            }
        };

        loadPdf();

    },[file]);

    if(!url){
        return <div>Chargement du PDF...</div>
    }

    return (
        <iframe
            src={url}
            className="w-full h-full"
            title="Aperçu PDF"
        />
    );
}