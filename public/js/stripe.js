import axios from 'axios'
const stripe = Stripe('pk_test_51Jv6ybEdz4Gt7HwphHH21Um9GOWGFgCV5HnUlzV88hzKHhgJmTx8td5avBNkgztwi9i3tTF9rJklSkCNiRn2GPiF00j5XCrrjg');

export const bookTour = async (tourId) => {
    console.log(tourId)
    try {
        // 1) Get checkout session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (error) {
        console.log(error)
    }
    // 2 ) Create checkout form in DOM
}