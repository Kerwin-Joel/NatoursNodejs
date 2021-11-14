const stripe       = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour         = require('../model/tourModel')
const User         = require('../model/userModel')
const factory      = require('../controllers/handleFactory')
const catchAsync   = require('../utils/catchAsync')
const Booking      = require('../model/bookingModel')


exports.getCheckoutSession = async(req, res,next) => {
    // 1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    // 2) Create session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [{
            quantity: 1,
            price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100,
                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                },
            },  
        }],
    });
    
    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
}
//this code isn within webhooks of the stripe, not secure
// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//     // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next()

//     await Booking.create({ tour, user, price })
//     res.redirect(req.originalUrl.split('?')[0])
// })

const createBookingCheckout = async session => {
    console.log('sessionnnnnnnn')
    console.log(session)
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
    console.log('check')
    const signature = req.headers['stripe-signature'];
    console.log('signature')
    console.log(signature)
    console.log(req.body)
    console.log(process.env.STRIPE_WEBHOOK_SECRET)
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("en el evento dentro del try",event)
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    console.log('eventdasdas')
    if (event.type === 'checkout.session.completed'){
        createBookingCheckout(event.data.object)
    }
    res.status(200).json({ received: true });
};
exports.createBooking = factory.createOne(Booking)
exports.getBooking    = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
