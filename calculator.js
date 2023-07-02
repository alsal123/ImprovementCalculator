let data;

Papa.parse('savings.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function(results) {
    data = results.data;
    populateStates();
  }
});

function populateStates() {
  let stateDropdown = document.getElementById('state');
  
  let states = [...new Set(data.map(row => row.State))];

  for(let state of states) {
    let option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateDropdown.appendChild(option);
  }
}

function populateDistricts() {
  let districtDropdown = document.getElementById('district');
  
  // Remove any existing options
  while(districtDropdown.firstChild) {
    districtDropdown.firstChild.remove();
  }
  
  let state = document.getElementById('state').value;
  
  let districts = data.filter(row => row.State === state);

  for(let district of districts) {
    let option = document.createElement('option');
    option.value = district.District;
    option.textContent = district.District;
    districtDropdown.appendChild(option);
  }
  
  // Auto-populate input fields with the first district's data
  if(districts.length > 0) {
    populateFields(districts[0]);
  }
}

// Update districts and fields when state changes
document.getElementById('state').addEventListener('change', populateDistricts);

function populateFields(districtData) {
  document.getElementById('students').value = districtData.students || '';
  document.getElementById('miles').value = districtData.miles || '';
  document.getElementById('pmroutes').value = districtData.pmroutes|| '';
}

// Update fields when district changes
document.getElementById('district').addEventListener('change', function() {
  let state = document.getElementById('state').value;
  let district = this.value;
  
  let districtData = data.find(row => row.State === state && row.District === district);
  
  if(districtData) {
    populateFields(districtData);
  }
});


//Calculation 
let savingsChart;

function calculate() {
    var pmroutes = document.getElementById("pmroutes").value; // Number of PM routes
    var students = document.getElementById("students").value; // Number of Students Transported
    var miles = document.getElementById("miles").value; // Average Route Distance (in miles)
    var avgStudentsPerRoute = students / pmroutes;

    // Determine scale factor based on average students per route
    var scaleFactor;
    if (avgStudentsPerRoute >= 30) {
    scaleFactor = 1.5;  // scale worse
    } else if (avgStudentsPerRoute >= 25) {
    scaleFactor = 1;  // same scale
    } else {
    scaleFactor = 0.5;  // half scale less
    }

    // calculate green savings, dollar savings, and safety improvements
    var hiring = (3 * ((pmroutes*1.4)/pmroutes))/2;  //  calculation green
    var systemSavings = scaleFactor; //  calculation money 
    var safetyImprovements = 2; //  calculation safety
    var newTime = (miles/pmroutes)/(2*(pmroutes*1.4)/pmroutes); // calculation time 

    // calculate old system
    var oldhiring = ((3 * ((pmroutes*1.4)/pmroutes))*0.5)/2;  //  calculation old green
    var oldsystemSavings = 1; //  calculation old money 
    var oldSafetyImprovements = 1; //  calculation old safety
    var oldTime = (miles/pmroutes); // calculation old time

    var ctx = document.getElementById('savingsChart').getContext('2d');
    if (savingsChart) {
        // Update existing chart
        savingsChart.data.datasets[0].data = [hiring, systemSavings, safetyImprovements, newTime];
        savingsChart.data.datasets[1].data = [oldhiring, oldsystemSavings, oldSafetyImprovements, oldTime];
        savingsChart.update();
    } else {
        // Create new chart
        savingsChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Driver Hiring Pool', 'Annual System Cost', 'Estimated System Safety', 'Max. Student Travel Time'],
                datasets: [{
                    label: 'Optimized System',
                    data: [hiring, systemSavings, safetyImprovements, newTime],
                    backgroundColor: 'rgba(0, 200, 100, 0.2)', // semi-transparent blue
                    borderColor: '#008CBA', // solid blue
                    borderWidth: 1
                }, {
                    label: 'Current System',
                    data: [oldhiring, oldsystemSavings, oldSafetyImprovements, oldTime],
                    backgroundColor: 'rgba(255, 0, 0, 0.2)', // semi-transparent red
                    borderColor: '#ff0000', // solid red
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    r: {suggestedMin: 0,
                        suggestedMax: 2.5,
                        ticks: {
                display: false // this hides the axis labels
                        
                    }
                }
            }
    }});
    }
    
  // Get the output element
  var outputElement = document.getElementById('output');

  // Set the output message
  outputElement.innerHTML = "By implementing a mixed fleet of buses and safety optimized vans, your ability to hire drivers has increased by " + ((hiring - oldhiring)*100).toFixed(2) + "%.  Your district will save " + (systemSavings - oldsystemSavings).toFixed(2) + " in fuel costs, but operate more total vehicles and drivers on shorter routes, resulting in " + (systemSavings - oldsystemSavings).toFixed(2) + 
  " change in total annual costs.<br> <br> Your estimated safety (estimated serious injuries and deaths / 1,000,000 student * years) has improved based on less time on the road, fewer low light pickups, safe routing and optimized stop design. Maximum travel times are reduced by " + ((oldTime - newTime)/oldTime*100).toFixed(2) + 
  "%, which is a huge benefit for your students. <br> <br> <a href='https://www.fleet-lab.com/contact' id='contactLink'>Contact Fleet Lab</a> for a free detailed assessment using additional information. <br> <br> <small>Note:  The above estimated performance changes are estimated, but realistic based on system characteristics and potential changes.</small>";

}
