import { useEffect, useState } from "react";
import { apiEndpoint } from "../../config/apiConfig";
import Spinner from "../loading/Spinner";

type RequestAndWaitProps = {
    endpoint : string, // Endpoint for the api call e.g. /subscribe
    requestBody : any, // Body to send in the api call
    responseMapping: Record<string, React.ReactElement>, // A mapping of api responses to the message to display
    requestDone? : CallableFunction // Signal when a request has finished executing
}

type ApiResponse = {
    message: string
}

function RequestAndWait({
    endpoint,
    requestBody,
    responseMapping,
    requestDone
} : RequestAndWaitProps) {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isFriendlyMessage, setIsFriendlyMessage ] = useState(true);
    const [ showMessage, setShowMessage ] = useState(false);
    const [ message, setMessage ] = useState<React.ReactElement>();    

    useEffect(() => {
        function doPost() {
            console.log("Calling the post");
            return fetch(apiEndpoint + "/" + endpoint, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
        }

        async function handle() {
            if (requestBody == null) {
                return;
            }

            setIsLoading(true);
            setShowMessage(false);
            try {
                const response = await doPost();

                // Check if we were successful
                if (response.status == 200) {
                    setIsFriendlyMessage(true);
                }
                else {
                    setIsFriendlyMessage(false);
                }

                // Work out what the feedback message should be
                const responseBody = await response.json() as ApiResponse;
                const responseMessage = responseMapping[responseBody.message];

                if (responseMessage == null) {
                    setMessage(<p>Something went wrong, please try again later.</p>);
                }
                else {
                    setMessage(responseMessage);
                }

            } catch (error) {
                setMessage(<p>Something went wrong, please try again later.</p>);
            }
            setIsLoading(false);
            setShowMessage(true);
            if (requestDone != undefined) {
                requestDone();
            }
        }

        handle();
    }, [requestBody]);

    return (
        <div>
            <div hidden={!isLoading}>
                <Spinner />
            </div>
            <div hidden={!showMessage}>
                <div className={`text-center ${isFriendlyMessage ? "text-blue-500" : "text-red-500"}`}>{message}</div>
            </div>
        </div>
    )
}

export default RequestAndWait;