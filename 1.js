       let monthlyPlan = JSON.parse(localStorage.getItem('sportmaster_monthly_plan')) || {
            turnover: 1000000,
            upt: 2.5,
            sbp: 40
        };
        
        let dailyData = JSON.parse(localStorage.getItem('sportmaster_daily_data')) || [];
        
        // DOM элементы
        const currentDateEl = document.getElementById('current-date');
        const summaryCardsEl = document.getElementById('summary-cards');
        const monthPlanForm = document.getElementById('month-plan-form');
        const dayDataForm = document.getElementById('day-data-form');
        const tableBody = document.getElementById('table-body');
        const emptyTable = document.getElementById('empty-table');
        const statsChartEl = document.getElementById('stats-chart');
        const emptyChart = document.getElementById('empty-chart');
        const showPerformanceBtn = document.getElementById('show-performance-btn');
        const showChartsBtn = document.getElementById('show-charts-btn');
        const clearDataBtn = document.getElementById('clear-data-btn');
        const exportDataBtn = document.getElementById('export-data-btn');
        const performanceModal = document.getElementById('performance-modal');
        const closePerformanceModal = document.getElementById('close-performance-modal');
        const closeModalBtn = document.querySelector('.close-modal');
        
        // Элементы ошибок
        const turnoverPlanError = document.getElementById('turnover-plan-error');
        const uptPlanError = document.getElementById('upt-plan-error');
        const sbpPlanError = document.getElementById('sbp-plan-error');
        const dayTurnoverError = document.getElementById('day-turnover-error');
        const dayUptError = document.getElementById('day-upt-error');
        const daySbpError = document.getElementById('day-sbp-error');
        
        // Валидация числа
        function validateNumber(value, min = 0, max = null, allowDecimal = true) {
            if (value === '' || isNaN(value) || value === null) {
                return { isValid: false, message: 'Введите число' };
            }
            
            const num = parseFloat(value);
            
            if (num < min) {
                return { isValid: false, message: `Значение должно быть не меньше ${min}` };
            }
            
            if (max !== null && num > max) {
                return { isValid: false, message: `Значение должно быть не больше ${max}` };
            }
            
            if (!allowDecimal && !Number.isInteger(num)) {
                return { isValid: false, message: 'Введите целое число' };
            }
            
            return { isValid: true, value: num };
        }
        
        // Показать/скрыть ошибку
        function showError(inputElement, errorElement, isValid) {
            if (isValid) {
                inputElement.classList.remove('error');
                errorElement.classList.remove('show');
            } else {
                inputElement.classList.add('error');
                errorElement.classList.add('show');
            }
        }
        
        // Инициализация даты
        function updateCurrentDate() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = now.toLocaleDateString('ru-RU', options);
        }
        
        // Форматирование чисел
        function formatNumber(num, decimals = 0) {
            if (decimals > 0) {
                return new Intl.NumberFormat('ru-RU', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(num);
            }
            return new Intl.NumberFormat('ru-RU').format(num);
        }
        
        // Расчет текущих значений
        function calculateCurrentStats() {
            if (dailyData.length === 0) {
                return {
                    turnover: 0,
                    upt: 0,
                    sbp: 0,
                    days: 0
                };
            }
            
            const totalTurnover = dailyData.reduce((sum, day) => sum + day.turnover, 0);
            const totalUpt = dailyData.reduce((sum, day) => sum + day.upt, 0);
            const totalSbp = dailyData.reduce((sum, day) => sum + day.sbp, 0);
            
            return {
                turnover: totalTurnover,
                upt: totalUpt / dailyData.length,
                sbp: totalSbp / dailyData.length,
                days: dailyData.length
            };
        }
        
        // Обновление карточек статистики
        function updateSummaryCards() {
            const currentStats = calculateCurrentStats();
            const planTurnover = monthlyPlan.turnover || 1;
            const planUpt = monthlyPlan.upt || 1;
            const planSbp = monthlyPlan.sbp || 1;
            
            const turnoverPercent = Math.min(100, (currentStats.turnover / planTurnover) * 100);
            const uptPercent = Math.min(100, (currentStats.upt / planUpt) * 100);
            const sbpPercent = Math.min(100, (currentStats.sbp / planSbp) * 100);
            
            // Определяем количество знаков после запятой для отображения
            const turnoverDecimals = currentStats.turnover % 1 === 0 ? 0 : 2;
            const uptDecimals = currentStats.upt % 1 === 0 ? 0 : 2;
            const sbpDecimals = currentStats.sbp % 1 === 0 ? 0 : 1;
            
            summaryCardsEl.innerHTML = `
                <div class="stat-card primary">
                    <div class="stat-header">
                        <div class="stat-title">ОБОРОТ</div>
                        <div class="stat-icon">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                    <div class="stat-value">${formatNumber(currentStats.turnover, turnoverDecimals)} ₽</div>
                    <div class="stat-progress">
                        <div class="progress-bar" style="width: ${turnoverPercent}%"></div>
                    </div>
                    <div class="stat-target">
                        <span>План: ${formatNumber(monthlyPlan.turnover, monthlyPlan.turnover % 1 === 0 ? 0 : 2)} ₽</span>
                        <span>${turnoverPercent.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="stat-card secondary">
                    <div class="stat-header">
                        <div class="stat-title">UPT</div>
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                    </div>
                    <div class="stat-value">${currentStats.upt.toFixed(2)}</div>
                    <div class="stat-progress">
                        <div class="progress-bar" style="width: ${uptPercent}%"></div>
                    </div>
                    <div class="stat-target">
                        <span>План: ${monthlyPlan.upt.toFixed(2)}</span>
                        <span>${uptPercent.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-header">
                        <div class="stat-title">СБП</div>
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                    <div class="stat-value">${currentStats.sbp.toFixed(1)}%</div>
                    <div class="stat-progress">
                        <div class="progress-bar" style="width: ${sbpPercent}%"></div>
                    </div>
                    <div class="stat-target">
                        <span>План: ${monthlyPlan.sbp.toFixed(1)}%</span>
                        <span>${sbpPercent.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }
        
        // Обновление таблицы данных
        function updateDataTable() {
            if (dailyData.length === 0) {
                emptyTable.style.display = 'block';
                tableBody.innerHTML = '';
                return;
            }
            
            emptyTable.style.display = 'none';
            
            // Сортировка данных по дате (новые сверху)
            const sortedData = [...dailyData].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            tableBody.innerHTML = sortedData.map(day => {
                const dateObj = new Date(day.date);
                const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                // Определение выполнения плана для дня
                const dailyTurnoverTarget = monthlyPlan.turnover / 30;
                const turnoverPerformance = day.turnover >= dailyTurnoverTarget * 0.9 ? 'good' : 
                                          day.turnover >= dailyTurnoverTarget * 0.7 ? 'average' : 'poor';
                
                const uptPerformance = day.upt >= monthlyPlan.upt * 0.9 ? 'good' : 
                                      day.upt >= monthlyPlan.upt * 0.7 ? 'average' : 'poor';
                
                const sbpPerformance = day.sbp >= monthlyPlan.sbp * 0.9 ? 'good' : 
                                      day.sbp >= monthlyPlan.sbp * 0.7 ? 'average' : 'poor';
                
                // Общая оценка дня
                const performanceClasses = {
                    good: 'performance-good',
                    average: 'performance-average',
                    poor: 'performance-poor'
                };
                
                let overallPerformance = 'average';
                if (turnoverPerformance === 'good' && uptPerformance === 'good' && sbpPerformance === 'good') {
                    overallPerformance = 'good';
                } else if (turnoverPerformance === 'poor' || uptPerformance === 'poor' || sbpPerformance === 'poor') {
                    overallPerformance = 'poor';
                }
                
                // Форматирование чисел для таблицы
                const turnoverDecimals = day.turnover % 1 === 0 ? 0 : 2;
                const uptDecimals = day.upt % 1 === 0 ? 0 : 2;
                const sbpDecimals = day.sbp % 1 === 0 ? 0 : 1;
                
                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${formatNumber(day.turnover, turnoverDecimals)} ₽</td>
                        <td>${day.upt.toFixed(uptDecimals)}</td>
                        <td>${day.sbp.toFixed(sbpDecimals)}%</td>
                        <td><span class="performance-badge ${performanceClasses[overallPerformance]}">
                            ${overallPerformance === 'good' ? 'Хорошо' : overallPerformance === 'average' ? 'Средне' : 'Плохо'}
                        </span></td>
                    </tr>
                `;
            }).join('');
        }
        
        // Показать модальное окно выполнения плана
        function showPerformanceModal() {
            const currentStats = calculateCurrentStats();
            const daysInMonth = 30; // Упрощенное представление
            const daysLeft = daysInMonth - currentStats.days;
            
            const avgDailyTurnover = currentStats.days > 0 ? currentStats.turnover / currentStats.days : 0;
            const neededDailyTurnover = daysLeft > 0 ? (monthlyPlan.turnover - currentStats.turnover) / daysLeft : 0;
            
            const avgDailyUpt = currentStats.upt;
            const neededDailyUpt = monthlyPlan.upt;
            
            const avgDailySbp = currentStats.sbp;
            const neededDailySbp = monthlyPlan.sbp;
            
            // Форматирование чисел
            const avgTurnoverDecimals = avgDailyTurnover % 1 === 0 ? 0 : 2;
            const neededTurnoverDecimals = neededDailyTurnover % 1 === 0 ? 0 : 2;
            
            let performanceHtml = `
                <div class="stat-card" style="margin-bottom: 20px;">
                    <div class="stat-header">
                        <div class="stat-title">ОБЩИЙ ПРОГРЕСС</div>
                        <div class="stat-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                    </div>
                    <div class="stat-value">${((currentStats.days / daysInMonth) * 100).toFixed(1)}% месяца</div>
                    <div class="stat-progress">
                        <div class="progress-bar" style="width: ${(currentStats.days / daysInMonth) * 100}%"></div>
                    </div>
                    <div class="stat-target">
                        <span>Дней прошло: ${currentStats.days}</span>
                        <span>Осталось: ${daysLeft}</span>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px;">Текущие средние показатели в день:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: 600; color: #777;">Оборот</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${formatNumber(avgDailyTurnover, avgTurnoverDecimals)} ₽</div>
                    </div>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: 600; color: #777;">UPT</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${avgDailyUpt.toFixed(2)}</div>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px;">Необходимые средние показатели до конца месяца:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: 600; color: #777;">Оборот</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${formatNumber(neededDailyTurnover, neededTurnoverDecimals)} ₽</div>
                    </div>
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: 600; color: #777;">UPT</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${neededDailyUpt.toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            // Добавить оценку выполнения плана
            const turnoverProgress = (currentStats.turnover / monthlyPlan.turnover) * 100;
            const uptProgress = (currentStats.upt / monthlyPlan.upt) * 100;
            const sbpProgress = (currentStats.sbp / monthlyPlan.sbp) * 100;
            
            let assessment = '';
            if (turnoverProgress >= 100 && uptProgress >= 100 && sbpProgress >= 100) {
                assessment = '<div style="background: #4caf50; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 20px;">План выполняется отлично! Продолжайте в том же духе!</div>';
            } else if (turnoverProgress >= 80 && uptProgress >= 80 && sbpProgress >= 80) {
                assessment = '<div style="background: #ff9800; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 20px;">План выполняется удовлетворительно. Есть возможность улучшить показатели.</div>';
            } else {
                assessment = '<div style="background: #f44336; color: white; padding: 15px; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 20px;">План выполняется недостаточно. Необходимо увеличить усилия по продажам.</div>';
            }
            
            performanceHtml += assessment;
            
            document.getElementById('performance-content').innerHTML = performanceHtml;
            performanceModal.style.display = 'flex';
        }
        
        // Показать графики
        function showCharts() {
            if (dailyData.length === 0) {
                alert('Нет данных для отображения графиков. Добавьте данные за день.');
                return;
            }
            
            emptyChart.style.display = 'none';
            statsChartEl.style.display = 'block';
            
            // Сортировка данных по дате
            const sortedData = [...dailyData].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const dates = sortedData.map(day => {
                const dateObj = new Date(day.date);
                return dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
            });
            
            const turnovers = sortedData.map(day => day.turnover);
            const upts = sortedData.map(day => day.upt);
            const sbps = sortedData.map(day => day.sbp);
            
            // Уничтожаем предыдущий график, если существует
            if (window.statsChart) {
                window.statsChart.destroy();
            }
            
            const ctx = statsChartEl.getContext('2d');
            window.statsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Оборот (руб.)',
                            data: turnovers,
                            borderColor: '#1e88e5',
                            backgroundColor: 'rgba(30, 136, 229, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            yAxisID: 'y',
                            tension: 0.2
                        },
                        {
                            label: 'UPT',
                            data: upts,
                            borderColor: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            yAxisID: 'y1',
                            tension: 0.2
                        },
                        {
                            label: 'СБП (%)',
                            data: sbps,
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            yAxisID: 'y2',
                            tension: 0.2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Дата'
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Оборот (руб.)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return formatNumber(value);
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'UPT'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                        y2: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'СБП (%)'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.datasetIndex === 0) {
                                        // Оборот
                                        const value = context.parsed.y;
                                        const decimals = value % 1 === 0 ? 0 : 2;
                                        label += formatNumber(value, decimals) + ' ₽';
                                    } else if (context.datasetIndex === 1) {
                                        // UPT
                                        const value = context.parsed.y;
                                        const decimals = value % 1 === 0 ? 0 : 2;
                                        label += value.toFixed(decimals);
                                    } else {
                                        // СБП
                                        const value = context.parsed.y;
                                        const decimals = value % 1 === 0 ? 0 : 1;
                                        label += value.toFixed(decimals) + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Сохранение плана на месяц
        monthPlanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация оборота
            const turnoverInput = document.getElementById('turnover-plan');
            const turnoverValidation = validateNumber(turnoverInput.value, 0);
            showError(turnoverInput, turnoverPlanError, turnoverValidation.isValid);
            
            // Валидация UPT
            const uptInput = document.getElementById('upt-plan');
            const uptValidation = validateNumber(uptInput.value, 0);
            showError(uptInput, uptPlanError, uptValidation.isValid);
            
            // Валидация СБП
            const sbpInput = document.getElementById('sbp-plan');
            const sbpValidation = validateNumber(sbpInput.value, 0, 100);
            showError(sbpInput, sbpPlanError, sbpValidation.isValid);
            
            // Если все валидно
            if (turnoverValidation.isValid && uptValidation.isValid && sbpValidation.isValid) {
                monthlyPlan = {
                    turnover: turnoverValidation.value,
                    upt: uptValidation.value,
                    sbp: sbpValidation.value
                };
                
                localStorage.setItem('sportmaster_monthly_plan', JSON.stringify(monthlyPlan));
                updateSummaryCards();
                updateDataTable();
                
                alert('План на месяц успешно сохранен!');
            } else {
                alert('Пожалуйста, исправьте ошибки в форме.');
            }
        });
        
        // Добавление данных за день
        dayDataForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let hasErrors = false;
            
            // Валидация оборота
            const dayTurnoverInput = document.getElementById('day-turnover');
            const dayTurnoverValidation = validateNumber(dayTurnoverInput.value, 0);
            showError(dayTurnoverInput, dayTurnoverError, dayTurnoverValidation.isValid);
            if (!dayTurnoverValidation.isValid) hasErrors = true;
            
            // Валидация UPT
            const dayUptInput = document.getElementById('day-upt');
            const dayUptValidation = validateNumber(dayUptInput.value, 0);
            showError(dayUptInput, dayUptError, dayUptValidation.isValid);
            if (!dayUptValidation.isValid) hasErrors = true;
            
            // Валидация СБП
            const daySbpInput = document.getElementById('day-sbp');
            const daySbpValidation = validateNumber(daySbpInput.value, 0, 100);
            showError(daySbpInput, daySbpError, daySbpValidation.isValid);
            if (!daySbpValidation.isValid) hasErrors = true;
            
            // Валидация даты
            const dateInput = document.getElementById('day-date');
            if (!dateInput.value) {
                alert('Пожалуйста, выберите дату.');
                hasErrors = true;
            }
            
            // Если есть ошибки, прерываем отправку
            if (hasErrors) {
                alert('Пожалуйста, исправьте ошибки в форме.');
                return;
            }
            
            const date = dateInput.value;
            const turnover = dayTurnoverValidation.value;
            const upt = dayUptValidation.value;
            const sbp = daySbpValidation.value;
            
            // Проверка на уникальность даты
            const existingDayIndex = dailyData.findIndex(day => day.date === date);
            
            if (existingDayIndex !== -1) {
                if (confirm('Данные за эту дату уже существуют. Хотите обновить их?')) {
                    dailyData[existingDayIndex] = { date, turnover, upt, sbp };
                } else {
                    return;
                }
            } else {
                dailyData.push({ date, turnover, upt, sbp });
            }
            
            localStorage.setItem('sportmaster_daily_data', JSON.stringify(dailyData));
            
            // Сброс формы
            document.getElementById('day-date').value = '';
            document.getElementById('day-turnover').value = '';
            document.getElementById('day-upt').value = '';
            document.getElementById('day-sbp').value = '';
            
            updateSummaryCards();
            updateDataTable();
            
            alert('Данные за день успешно добавлены!');
        });
        
        // Очистка всех данных
        clearDataBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
                localStorage.removeItem('sportmaster_daily_data');
                dailyData = [];
                updateSummaryCards();
                updateDataTable();
                
                // Скрыть график, если он отображается
                emptyChart.style.display = 'block';
                statsChartEl.style.display = 'none';
                
                alert('Все данные удалены.');
            }
        });
        
        // Экспорт данных
        exportDataBtn.addEventListener('click', function() {
            const dataToExport = {
                monthlyPlan,
                dailyData,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `sportmaster_data_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            alert('Данные успешно экспортированы в файл JSON.');
        });
        
        // Показать выполнение плана
        showPerformanceBtn.addEventListener('click', showPerformanceModal);
        
        // Показать графики
        showChartsBtn.addEventListener('click', showCharts);
        
        // Закрытие модального окна
        closePerformanceModal.addEventListener('click', function() {
            performanceModal.style.display = 'none';
        });
        
        closeModalBtn.addEventListener('click', function() {
            performanceModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === performanceModal) {
                performanceModal.style.display = 'none';
            }
        });
        
        // Инициализация формы плана текущими значениями
        function initializeFormValues() {
            document.getElementById('turnover-plan').value = monthlyPlan.turnover;
            document.getElementById('upt-plan').value = monthlyPlan.upt;
            document.getElementById('sbp-plan').value = monthlyPlan.sbp;
            
            // Установить сегодняшнюю дату по умолчанию в форме добавления дня
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('day-date').value = today;
        }
        
        // Инициализация приложения
        function initApp() {
            updateCurrentDate();
            initializeFormValues();
            updateSummaryCards();
            updateDataTable();
            
            // Скрыть график по умолчанию
            emptyChart.style.display = 'block';
            statsChartEl.style.display = 'none';
            
            // Добавить обработчики для сброса ошибок при вводе
            document.getElementById('turnover-plan').addEventListener('input', function() {
                showError(this, turnoverPlanError, true);
            });
            
            document.getElementById('upt-plan').addEventListener('input', function() {
                showError(this, uptPlanError, true);
            });
            
            document.getElementById('sbp-plan').addEventListener('input', function() {
                showError(this, sbpPlanError, true);
            });
            
            document.getElementById('day-turnover').addEventListener('input', function() {
                showError(this, dayTurnoverError, true);
            });
            
            document.getElementById('day-upt').addEventListener('input', function() {
                showError(this, dayUptError, true);
            });
            
            document.getElementById('day-sbp').addEventListener('input', function() {
                showError(this, daySbpError, true);
            });
            
            // Улучшение для мобильных устройств
            improveMobileExperience();
        }
        
        // Улучшение опыта на мобильных устройствах
        function improveMobileExperience() {
            // Предотвращение масштабирования при фокусе на поле ввода
            document.querySelectorAll('input, select').forEach(el => {
                el.addEventListener('focus', function() {
                    if (window.innerWidth <= 768) {
                        // Небольшая задержка для плавного скролла
                        setTimeout(() => {
                            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }
                });
            });
            
            // Закрытие клавиатуры при клике вне поля ввода
            document.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
                    document.activeElement.blur();
                }
            });
        }
        
        // Запуск приложения
        document.addEventListener('DOMContentLoaded', initApp);