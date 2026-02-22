function initiateTopup(amount) {
    Swal.fire({
        title: 'Confirm Top-up',
        text: `Do you want to add ₹${amount} to your wallet?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#111111', // Matches your theme
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Pay Now!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
       
        if (result.isConfirmed) {
            openRazorpay(amount);
        }
    });
}


function initiateCustomTopup() {
    const amount = parseInt(document.getElementById('customAmount').value);
    if (!amount || amount < 1) return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Please enter a valid amount' });
    if (amount > 50000) return Swal.fire({ icon: 'warning', title: 'Too Much!', text: 'Maximum top-up is ₹50,000' });
    openRazorpay(amount);
}





async function openRazorpay(amount) {
    try {
        const res = await fetch("/user/wallet/topup/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (!data.success) {
    Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: 'Failed to create payment order. Please try again.'
    });
    return; 
}


        const rzp = new Razorpay({
            key: data.key,
            amount: data.order.amount,
            currency: "INR",
            name: "SoleStyle",
            description: "Wallet Top-up",
            order_id: data.order.id,
            handler: async function (response) {
                const verifyRes = await fetch("/user/wallet/topup/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        amount
                    })
                });
                const result = await verifyRes.json();
                if (result.success) {
                    Swal.fire({ icon: 'success', title: 'Wallet Topped Up!', text: `₹${amount} added successfully!` })
                        .then(() => window.location.reload());
                } else {
                    Swal.fire({ icon: 'error', title: 'Verification Failed', text: 'Contact support.' });
                }
            },
            theme: { color: "#111111" }
        });
        rzp.open();
    } catch (error) {
        console.error('Topup error:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong. Try again.' });
    }
}