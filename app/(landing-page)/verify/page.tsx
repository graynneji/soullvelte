import VerifyOTP from '@/app/_components/VerifyOTP/VerifyOTP'
import { Suspense } from "react";

function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOTP />
        </Suspense>
    )
}

export default Page