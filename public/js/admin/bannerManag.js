document.getElementById("addBannerForm").addEventListener("submit",async(e)=>{
    e.preventDefault();


const formData=new FormData(e.target);

try {
    const response=await fetch("/admin/banners/add",{
        method:"POST",
        body:formData
    });

    const result =await response.json();
    if(result.success){
        Swal.fire("Success","Banner added","success").then(()=>location.reload());
    }else{
        Swal.fire("Error",result.message,"error");
    }
} catch (error) {
    Swal.fire("Error","Something went wrong","error");
}

});