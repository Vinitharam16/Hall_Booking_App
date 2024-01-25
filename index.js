const express = require('express');
const bodyParser = require('body-parser');


const HTTP_SERVER = express();
HTTP_SERVER.use(bodyParser.json());

// postman documentation- https://documenter.getpostman.com/view/31850794/2s9YypFP27


// creating local variables for storing data

let room = [{
    roomID: "R1",
    seatsAvailable: "4",
    amentities: "tv,Ac,heater",
    pricePerhr: "200",
}];

let bookings = [{
    customer: "Ram",
    bookingDate: "20240201",
    startTime: "12:00pm",
    endTime: "11.59am",
    bookingID: "A1",
    roomID: "R1",
    status: "booked",
    booked_On: "14/1/2024"
}];

let customers = [
    {
        name: "Ram",
        bookings: [
            {
                customer: "Ram",
                bookingDate: "20240201",
                startTime: "12:00pm",
                endTime: "11.59am",
                bookingID: "A1",
                roomID: "R1",
                status: "booked",
                booked_On: "14/1/2024"
            }
        ]
    }
]


// Defining A Port and listening to port with express server
const PORT = 5000;
HTTP_SERVER.listen(PORT, () => {
    console.log("Server started successfully" + PORT);
});

// view all Rooms and its details
HTTP_SERVER.get("/room/all", (req, res) => {
    res.status(200).json({
        RoomsList: room
    })
});

// Creating room
HTTP_SERVER.post('/rooms/create', (req, res) => {
    const createRoom = req.body;
    const existroomid = room.find((data) => data.roomID === room.roomID)
    if (existroomid !== undefined) {
        return res.status(200).json({ message: "room already exists" });
    }
    else {
        room.push(createRoom);
        res.status(201).json({ message: "room created" });
    }

});

// Booking room
HTTP_SERVER.post("/booking/create/:id", (req, res) => {
    try {
        const { id } = req.params;
        let bookroom = req.body;
        let date = new Date();
        let dateFormat = date.toLocaleDateString();
        let existroomid = room.find((el) => el.roomID === id)
        if (existroomid !== undefined) {
            return res.status(400).json({
                message: "room does not exist",
                RoomsList: room,
            });

        }

        //verifying booking date

        let matchID = bookings.filter((b) => b.roomID === id)
        if (matchID.length > 0) {
            let checkDate = matchID.filter((d) => {
                return d.bookingDate === bookroom.bookingDate
            })
            if (checkDate.length === 0) {
                let newID = "A" + (bookings.length + 1);
                let newbooking = { ...bookroom, bookingID: newID, roomID: id, status: "booked", booked_On: dateFormat }
                bookings.push(newbooking);
                return res.status(201).json({
                    message: "hall booked",
                    Bookings: bookings,
                    added: newbooking
                });
            }
            else {
                return res.status(400).json({
                    message: "hall already booked for this date, choose another hall",
                    Bookings: bookings
                });
            }
        }
        else {
            let newID = "A" + (bookings.length + 1);
            let newbooking = { ...bookroom, bookingID: newID, roomID: id, status: "booked", booked_On: dateFormat }
            bookings.push(newbooking);
            const customerdetails = customers.find((c) => c.name === newbooking.customer);
            if (customerdetails) {
                customerdetails.bookings.push(newbooking);
            }
            else {
                customers.push({ name: newbooking.customer, bookings: [newbooking] });
            }
            return res.status(201).json({
                message: "hall booked",
                Bookings: bookings,
                added: newbooking
            });
        }

    } catch (error) {
        res.status(400).json({
            message: "Error in booking room",
            error: error,
            data: bookings
        });

    }    


})

// viewing all booked room data

HTTP_SERVER.get('/viewbooking', (req, res) => {
    const bookedrooms = bookings.map(booking => {
        const { roomID, status, customer, bookingDate, startTime, endTime } = booking;
        return { roomID, status, customer, bookingDate, startTime, endTime }
    });
    res.status(201).json(bookedrooms);
})

//customers list with booked data

HTTP_SERVER.get('/customers', (req, res) => {
    const cutomerBookings = customers.map(customer => {
        const { name, bookings } = customer;
        const customerDetails = bookings.map(booking => {
            const { roomID, bookingDate, startTime, endTime } = booking;
            return { name, roomID, bookingDate, startTime, endTime };
        });
        return customerDetails;
    })
    res.status(201).json(cutomerBookings);

});

// list how many times a customer has booked the room 
HTTP_SERVER.get('/customer/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(c => c.name === name);
    if (!customer) {
        res.status(400).json({
            error: "Customer not found"
        })
        return;
    }
    const customerbookings = customer.bookings.map(booking => {
        const { customer, roomID, bookingDate, startTime, endTime, bookingID, booked_On, status } = booking;
        return { customer, roomID, bookingDate, startTime, endTime, bookingID, booked_On, status };
    });
    res.status(201).json(customerbookings);
})