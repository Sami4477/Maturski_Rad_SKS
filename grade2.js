document.addEventListener('DOMContentLoaded', () => {
    const classScheduleDiv = document.getElementById('class-schedule');
    const mirrorButton = document.getElementById('mirror-button');
    
    const classButtonsDiv = document.getElementById('class-buttons');
    let currentSchedule = null;


    fetch('/logo')
        .then(response => response.json())
        .then(data => {
            const logo = document.getElementById('logo');
            logo.src = data.logo;
        })
        .catch(error => console.error('Greška pri učitavanju logotipa:', error));


    createClassButtons();

    function createClassButtons() {
        // Clear existing buttons
        classButtonsDiv.innerHTML = '';
        
        // Get grade number from current page URL
        const currentPage = window.location.pathname;
        const gradeNumber = currentPage.includes('grade1') ? '1' : 
                           currentPage.includes('grade2') ? '2' :
                           currentPage.includes('grade3') ? '3' : '4';
    
        for (let i = 1; i <= 6; i++) {
            const button = document.createElement('button');
            const className = `${gradeNumber}-${i}`;
            
            // Set button attributes and classes
            button.className = 'class-button';
            button.setAttribute('data-class', className);
            
            // Create button content with icon and text
            button.innerHTML = `
                <i class="fas fa-users"></i>
                <span>${romanNumeral(gradeNumber)}-${i}</span>
            `;
            
            // Add click event handler
            button.addEventListener('click', function() {
                // Remove selected class from all buttons
                document.querySelectorAll('.class-button').forEach(btn => 
                    btn.classList.remove('selected'));
                
                // Add selected state to clicked button
                this.classList.add('selected', 'loading');
                
                try {
                    // Call showSchedule with proper class identifier
                    showSchedule(className);
                    
                    // Remove loading state after schedule loads
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 800);
                } catch (error) {
                    console.error('Error loading schedule:', error);
                    this.classList.remove('loading');
                    // Add error state to button
                    this.classList.add('error');
                    setTimeout(() => this.classList.remove('error'), 2000);
                }
            });
            
            classButtonsDiv.appendChild(button);
        }
    }
    function romanNumeral(num) {
        const romanNumerals = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV'
        };
        return romanNumerals[num] || num;
    }
    const style = document.createElement('style');
style.textContent = `
    .class-button.error {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        background: linear-gradient(135deg, #ff6b6b, #ff5252) !important;
    }
    
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);

    function showSchedule(classId) {
        fetch(`/schedule/${classId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nisam dodao raspored, molim te da me kontaktiras na email-u kako bih dodao');
                }
                return response.json();
            })
            .then(data => {
                currentSchedule = data;
                classScheduleDiv.innerHTML = createScheduleHtml(data);
                mirrorButton.style.display = 'block';
            })
            .catch(error => {
                classScheduleDiv.innerHTML = `<p>Greška: ${error.message}</p>`;
                mirrorButton.style.display = 'none';
            });
    }


    function createScheduleHtml(schedule) {
        const times = ['8:00-8:45', '8:50-9:35', '9:40-10:25', '10:45-11:30', '11:35-12:20', '12:25-13:10', 
                       '13:40-14:25', '14:30-15:15', '15:20-16:05', '16:25-17:10', '17:15-18:00', '18:05-18:50'];
        let html = '<table><tr><th>Vrijeme</th><th>PON</th><th>UTO</th><th>SRI</th><th>ČET</th><th>PET</th></tr>';
        times.forEach((time, index) => {
            html += `<tr><td>${time}</td>`;
            ['PON', 'UTO', 'SRI', 'CET', 'PET'].forEach(day => {
                html += `<td>${schedule[day][index] || ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    window.mirrorSchedule = function() {
        if (!currentSchedule) {
            alert('Nema rasporeda za ogledalo!');
            return;
        }

        const mirroredSchedule = {};
        for (const [day, subjects] of Object.entries(currentSchedule)) {
            mirroredSchedule[day] = subjects.reverse();
        }

        const lastLessonTime = findLastLessonTime(currentSchedule);
        const newStartTime = calculateNewStartTime(lastLessonTime);

        classScheduleDiv.innerHTML = createScheduleHtml(mirroredSchedule);
        alert(`Obrnuo sam raspored`);
    };

    function findLastLessonTime(schedule) {
        const times = ['8:00', '8:50', '9:40', '10:45', '11:35', '12:25', '13:40', '14:30', '15:20', '16:25', '17:15', '18:05'];
        for (let i = times.length - 1; i >= 0; i--) {
            for (const day in schedule) {
                if (schedule[day][i]) {
                    return times[i];
                }
            }
        }
        return '8:00';
    }

    function calculateNewStartTime(lastTime) {
        const [hours, minutes] = lastTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const minutesToEnd = 18 * 60 + 50 - totalMinutes;
        const newStartMinutes = 8 * 60 + Math.min(50, minutesToEnd);
        const newHours = Math.floor(newStartMinutes / 60);
        const newMinutes = newStartMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }

    
    mirrorButton.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', createClassButtons);