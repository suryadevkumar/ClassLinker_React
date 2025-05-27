import sorry_img from "../assets/img/sorry.png";

const UnverifiedCard=()=>{
    return(
        <>
            <div className="bg-gray-100 p-6 space-y-12 my-44 rounded-md text-center w-9/12 md:w-1/3 mx-auto">
                <h2 className="text-2xl font-bold">Waiting for Details verification!</h2>
                <img src={sorry_img} alt="Sorry" className="w-48 mx-auto" />
            </div>
        </>
    )
}

export default UnverifiedCard;