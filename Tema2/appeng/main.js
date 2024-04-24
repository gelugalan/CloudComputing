const firebaseConfig = {
    apiKey: "AIzaSyDzgnU7NVvkxPVLS6rOz8eKZimY0-8vGWs",
    authDomain: "cctema3-fd403.firebaseapp.com",
    databaseURL: "https://cctema3-fd403-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cctema3-fd403",
    storageBucket: "cctema3-fd403.appspot.com",
    messagingSenderId: "131547164369",
    appId: "1:131547164369:web:f384a9ed8bb2bebbbb5ff0"
};

window.onload = function() {
    var loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        
        document.getElementById('logout').style.display = 'block';
        document.getElementById('create').style.display = 'block';
        document.getElementById('showlocations').style.display = 'block';
        document.getElementById('login').style.display = 'none'; 
    } else {
        
        document.getElementById('logout').style.display = 'none';
        document.getElementById('create').style.display = 'none';
        document.getElementById('showlocations').style.display = 'none';
        document.getElementById('login').style.display = 'block';
    }
}

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

function getLocations() {
    locationsRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const location = childSnapshot.val();
            createProductContainer(location, productInfoContainer);
        });
    });
}

function initMap() {
    
    const productInfoContainer = document.getElementById('product-info-container');
    
    
    console.log("1");
    getLocations();

    
    function getLocations() {
        
        console.log("11");
        const locationsRef = database.ref('locations');
        console.log("2");
        
        locationsRef.once('value', function(snapshot) {
            console.log("3");
            snapshot.forEach(function(childSnapshot) {
                
                const locationKey = childSnapshot.key;
                const locationData = childSnapshot.val();
                
                
                console.log("5");
                createProductContainer(locationData, productInfoContainer);
                console.log("6");
            });
        });
    }
}

function createProductContainer(location, parentContainer) {
    
    const productContainer = document.createElement('div');
    productContainer.classList.add('product-container');

    
    const productName = document.createElement('h2');
    productName.textContent = location.name;
    productContainer.appendChild(productName);

    const productDescription = document.createElement('p');
    productDescription.textContent = location.description;
    productContainer.appendChild(productDescription);

    
    const mapContainer = document.createElement('div');
    mapContainer.classList.add('map-container');
    productContainer.appendChild(mapContainer);

    
    createMap({ lat: location.lat, lng: location.lng }, mapContainer);

    
    parentContainer.appendChild(productContainer);
}

function createMap(location, container) {
    
    const map = new google.maps.Map(container, {
        zoom: 12, 
        center: location 
    });

    
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'Nume locație'
    });
}

function logout() {
    firebase.auth().signOut().then(function() {
        localStorage.setItem('loggedIn', 'false'); 
        console.log('Logout succes');
        location.reload();
    }).catch(function(error) {
        console.error('Logout failed:', error);
    });
}
const locations2 = [
    { name: "New York", lat: 40.7128, lng: -74.0060, description: "Descriere produs 1" },
    { name: "Dumbraveni", lat: 47.6562, lng: 26.4265, description: "Descriere produs 2" },
];

function createLocation(name, lat, lng, description) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const databaseRef = database.ref('locations');
        
        const locationData = {
            name: name,
            lat: lat,
            lng: lng,
            description: description,
            userId: userId 
        };

        databaseRef.push(locationData)
            .then(function() {
                alert('Locația a fost adăugată cu succes în baza de date Firebase!');
                location.reload();
            })
            .catch(function(error) {
                alert('Eroare la adăugarea locației în baza de date Firebase: ' + error.message);
            });
    } else {
        alert('You must be logged in to create a location.');
    }
}


function toggleLocationForm() {
    const locationForm = document.getElementById('location-form');
    if (locationForm.style.display === 'none') {
        locationForm.style.display = 'block';
    } else {
        locationForm.style.display = 'none';
    }
}
function toggleLoginForm() {
    const loginForm = document.getElementById('content_container');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
}

function submitLocation() {
    const name = document.getElementById('location-name').value;
    const lat = parseFloat(document.getElementById('location-lat').value);
    const lng = parseFloat(document.getElementById('location-lng').value);
    const description = document.getElementById('location-description').value;

    if (name && !isNaN(lat) && !isNaN(lng) && description) {
        createLocation(name, lat, lng, description);
    } else {
        alert("Te rog completează toate câmpurile.");
    }
}

function getEmailsFromDatabase() {
    return new Promise((resolve, reject) => {
        const emails = [];
        database.ref('users').once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                const email = childSnapshot.val().email;
                emails.push(email);
                console.log(emails)
            });
            resolve(emails);
        }, function(error) {
            reject(error);
        });
    });
}


// function afterLocationAdded(locationInfo) {
//     getEmailsFromDatabase()
//         .then(emails => {
//             sendEmails(emails, locationInfo); 
//         })
//         .catch(error => {
//             console.error('Eroare la obținerea adresele de e-mail din baza de date:', error);
//         });
// }

// Funcția pentru a trimite e-mailuri folosind Gmail API
// function sendEmails(emails, locationInfo) {
//     const emailSubject = "Notificare: Locație nouă adăugată";
//     const emailBody = `O nouă locație a fost adăugată:\nNume: ${locationInfo.name}\nDescriere: ${locationInfo.description}\nLatitudine: ${locationInfo.lat}\nLongitudine: ${locationInfo.lng}`;

//     // Encode the email body
//     const encodedBody = encodeURIComponent(emailBody);

//     // Construct the email
//     const email = {
//         to: emails.join(','), 
//         subject: emailSubject,
//         body: emailBody
//     };

//     
//     gapi.client.gmail.users.messages.send({
//         'userId': 'me',
//         'resource': {
//             'raw': window.btoa(
//                 'Content-Type: text/plain\r\n' +
//                 'To: ' + emails + '\r\n' +
//                 'Subject: ' + email.subject + '\r\n\r\n' +
//                 encodedBody
//             ).replace(/\+/g, '-').replace(/\//g, '_')
//         }
//     }).then(response => {
//         console.log('Email sent successfully:', response);
//     }).catch(error => {
//         console.error('Error sending email:', error);
//     });
// }

function register () {
    
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    full_name = document.getElementById('full_name').value
    
    
  
    
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('Email or Password is Outta Line!!')
      return
      
    }
    
   
    
    auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
      
      var user = auth.currentUser
  
      
      var database_ref = database.ref()
  
      
      var user_data = {
        email : email,
        full_name : full_name,
        last_login : Date.now()
      }
  
      
      database_ref.child('users/' + user.uid).set(user_data)
  
      
      localStorage.setItem('loggedIn', 'true'); 
        alert('User Created!!');
        location.reload();
    })
    .catch(function(error) {
      
      var error_code = error.code
      var error_message = error.message
  
      alert(error_message)
    })
  }
  
  
  function login () {
    
    email = document.getElementById('email').value
    password = document.getElementById('password').value
  
    
    if (validate_email(email) == false || validate_password(password) == false) {
      alert('Email or Password is Outta Line!!')
      return
      
    }
  
    auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      
      var user = auth.currentUser
  
      
      var database_ref = database.ref()
  
      
      var user_data = {
        last_login : Date.now()
      }
  
      /
      database_ref.child('users/' + user.uid).update(user_data)
  
      
      localStorage.setItem('loggedIn', 'true'); 
    alert('User Logged In!!');
    location.reload();
  
    })
    .catch(function(error) {
      
      var error_code = error.code
      var error_message = error.message
  
      alert(error_message)
    })
  
  }
  
  
  
  
  
  function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
      
      return true
    } else {
      
      return false
    }
  }
  
  function validate_password(password) {
    
    if (password < 6) {
      return false
    } else {
      return true
    }
  }
  
  function validate_field(field) {
    if (field == null) {
      return false
    }
  
    if (field.length <= 0) {
      return false
    } else {
      return true
    }
  }
  
  function showMyLocations() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userLocationsRef = database.ref('locations').orderByChild('userId').equalTo(userId);
        const productInfoContainer = document.getElementById('product-info-container');
        productInfoContainer.innerHTML = ''; 
        
        userLocationsRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                const location = childSnapshot.val();
                createProductContainer(location, productInfoContainer);
            });
        });
    } else {
        alert('Please log in to see your locations.');
    }
}

