import { useToast } from "#/lib/toast/use-toast";
import type { AttachDto } from "#/module/attachs/dto";
import { useUploadAttach } from "#/module/attachs/hooks/use-upload-attach";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FilePond } from "react-filepond";

export function FileUploadComponent({setAttachState} : {setAttachState: (attach: AttachDto) => void}) {
    const filePondRef = useRef<any>(null)
    const { toastSuccess, toastError } = useToast()
    const { handleUploadAttach } = useUploadAttach()

    const uploadMutation = useMutation({
        mutationFn: (file: File) => handleUploadAttach(file),
        onSuccess: (data: AttachDto) => {
            setAttachState(data)
            toastSuccess('Tải ảnh thành công')
        },
        onError: () => {
            toastError('Tải ảnh thất bại')
        }
    })

    return (
        <FilePond 
            ref={filePondRef}
            allowMultiple={true}
            maxFiles={5}
            allowImageResize={true}
            imageResizeTargetWidth={800}
            imageResizeMode="contain"
            imageResizeUpscale={false}
            allowImageTransform={true}
            labelIdle='<span class="text-xs">Kéo thả ảnh hoặc <span class="filepond--label-action">Chọn tệp</span> (Tối đa 5 ảnh)</span>'
            server={{
                process: async (fileName, file, metadata, load, error, progress, abort) => {
                    try {
                        await uploadMutation.mutateAsync(file as File)
                        load('ok')
                    } catch (e) {
                        error('Upload failed')
                    }
                }
            }}
        />
    )
}   