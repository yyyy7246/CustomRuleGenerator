let allRules = [];
let currentLaws = new Set();
let currentClauses = new Set();
let selectedChecks = new Set();
let currentSeverities = new Set();

// 고유 ID 생성을 위한 카운터
let idCounter = 0;

function createSafeId(prefix, text) {
    // 카운터 증가
    idCounter++;
    
    // 텍스트 정리
    const safeText = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    
    // 현재 시간의 밀리초와 카운터를 조합
    const timestamp = new Date().getTime();
    const uniqueId = `${prefix}_${safeText}_${timestamp}_${idCounter}`;
    
    return uniqueId;
}

// fetch 부분을 제거하고 다음 코드로 대체
document.addEventListener('DOMContentLoaded', () => {
    // data.js에서 정의된 allRulesData를 사용
    allRules = allRulesData;
    setupLawFilter();
    setupSeverityFilter(); 
    setupResetButton();
    renderRules(allRules);
    groupRulesByService();
    
});

function getCategoryColor(category) {
    const colorMap = {
        '로그': '#4A90E2',           // 파란색
        '복구': '#50E3C2',           // 민트색
        '접근통제': '#F5A623',       // 주황색
        '권한관리': '#D0021B',       // 빨간색
        '최신 기술 사용 여부': '#7ED321', // 초록색
        '가용성': '#9013FE',         // 보라색
        '무결성': '#417505',         // 진한 초록색
        '기밀성': '#BD10E0',         // 자주색
        '데이터 파기 관리': '#B8E986', // 연한 초록색
        '모니터링': '#4A4A4A',       // 회색
        '인증수단 관리': '#8B572A',   // 갈색
        '암호화': '#FF9500'          // 밝은 주황색
    };
    return colorMap[category] || '#9B9B9B'; // 기본 색상
}


// 법률 필터 설정
function setupLawFilter() {
    const lawFilterContainer = document.getElementById("lawFilterContainer");
    lawFilterContainer.innerHTML = "";
    
    const laws = ["GDPR", "CCPA", "개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
    
    laws.forEach(law => {
        const uniqueId = createSafeId('law', law);
        const wrapper = document.createElement("div");
        wrapper.className = "filter-item";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = uniqueId;
        checkbox.name = uniqueId;
        checkbox.className = "form-check-input";
        checkbox.value = law;
        
        const label = document.createElement("label");
        label.htmlFor = uniqueId;
        label.className = "form-check-label";
        label.textContent = law;
        
        checkbox.addEventListener("change", (e) => {
            e.stopPropagation();
            if (checkbox.checked) {
                currentLaws.add(law);
            } else {
                currentLaws.delete(law);
                // 해당 법률과 관련된 모든 조항 제거
                currentClauses.forEach(clause => {
                    if (clause.includes(`(${law})`)) {
                        currentClauses.delete(clause);
                    }
                });
            }
            updateClauses();
            filterAndRenderRules();
        });
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        
        wrapper.addEventListener("click", (e) => {
            if (e.target !== checkbox && e.target !== label) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change"));
            }
        });
        
        lawFilterContainer.appendChild(wrapper);
    });
}
function setupSeverityFilter() {
    const severityFilterContainer = document.getElementById("severityFilterContainer");
    severityFilterContainer.innerHTML = "";

    const severities = ["critical", "high", "medium", "low"];
    const severitySection = document.createElement("div");
    // justify-content-around로 수정하여 균등한 간격 배치
    severitySection.className = "d-flex justify-content-around align-items-center w-100 px-4";

    const severityColors = {
        'critical': '#dc3545',
        'high': '#fd7e14',
        'medium': '#ffc107',
        'low': '#6c757d'
    };

    severities.forEach(severity => {
        const uniqueId = createSafeId('severity', severity);
        const wrapper = document.createElement("div");
        // flex-grow-1과 mx-4를 추가하여 간격 조정
        wrapper.className = "d-flex align-items-center flex-grow-1 mx-4";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = uniqueId;
        checkbox.className = "form-check-input me-3";
        
        // 체크박스 테두리 스타일 추가
        checkbox.style.borderColor = '#0d6efd';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';

        const label = document.createElement("label");
        label.htmlFor = uniqueId;
        label.className = "severity-tag border rounded px-4 py-2";
        label.style.color = severityColors[severity];
        label.style.borderColor = severityColors[severity];
        label.textContent = severity.charAt(0).toUpperCase() + severity.slice(1);
        // 라벨 커서 스타일 추가
        label.style.cursor = 'pointer';

        // 클릭 이벤트 처리
        checkbox.addEventListener("change", (e) => {
            if (checkbox.checked) {
                currentSeverities.add(severity);
                label.style.backgroundColor = severityColors[severity];
                label.style.color = severity === 'medium' ? '#000' : '#fff';
            } else {
                currentSeverities.delete(severity);
                label.style.backgroundColor = '';
                label.style.color = severityColors[severity];
            }
            filterAndRenderRules();
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        severitySection.appendChild(wrapper);
    });

    severityFilterContainer.appendChild(severitySection);
}

function setupResetButton() {
    document.getElementById('resetFilters').addEventListener('click', () => {

        // 위험도 필터 다시 생성
        setupSeverityFilter();
        
        // 조항 체크박스 초기화
        document.querySelectorAll('#clauseFilterContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // 법률 체크박스 초기화
        document.querySelectorAll('#lawFilterContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Set 초기화
        currentSeverities.clear();
        currentClauses.clear();
        currentLaws.clear();
        
        // 조항 컨테이너 초기화
        const clauseFilterContainer = document.getElementById("clauseFilterContainer");
        if (clauseFilterContainer) {
            clauseFilterContainer.innerHTML = "";
        }
        
        // 필터 적용하여 화면 갱신
        filterAndRenderRules();
    });
}


// 조항 필터 업데이트
function updateClauses() {
    const clauseFilterContainer = document.getElementById("clauseFilterContainer");
    clauseFilterContainer.innerHTML = "";
    
    if (currentLaws.size === 0) return;

    currentLaws.forEach(law => {
        const lawSection = document.createElement("div");
        lawSection.className = "law-section";
        
        const lawTitle = document.createElement("div");
        lawTitle.className = "law-title";
        lawTitle.textContent = law;
        lawSection.appendChild(lawTitle);

        const clauses = new Set();
        allRules.forEach(rule => {
            if (rule[law]) {
                const clauseList = rule[law].toString().split(/[\s,]+/);
                clauseList.forEach(clause => {
                    if (clause.trim()) clauses.add(clause.trim());
                });
            }
        });

        const sortedClauses = [...clauses].sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || 0);
            const numB = parseInt(b.match(/\d+/)?.[0] || 0);
            return numA - numB;
        });

        sortedClauses.forEach(clause => {
            const uniqueId = createSafeId('clause', `${law}_${clause}`);
            const wrapper = document.createElement("div");
            wrapper.className = "filter-item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = uniqueId;
            checkbox.name = uniqueId;
            checkbox.className = "form-check-input";
            checkbox.value = `${clause} (${law})`;
            
            // 이전 상태 유지를 위한 체크 상태 설정
            checkbox.checked = currentClauses.has(`${clause} (${law})`);

            const label = document.createElement("label");
            label.htmlFor = uniqueId;
            label.className = "form-check-label";
            label.textContent = `${clause} (${law})`;

            checkbox.addEventListener("change", (e) => {
                e.stopPropagation();
                if (checkbox.checked) {
                    currentClauses.add(checkbox.value);
                } else {
                    currentClauses.delete(checkbox.value);
                }
                filterAndRenderRules();
            });

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            wrapper.addEventListener("click", (e) => {
                if (e.target !== checkbox && e.target !== label) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event("change"));
                }
            });

            lawSection.appendChild(wrapper);
        });

        clauseFilterContainer.appendChild(lawSection);
    });
}

// 룰 필터링
function filterAndRenderRules() {
    const filteredRules = allRules.filter(rule => {
        if (currentLaws.size === 0 && currentClauses.size === 0 && currentSeverities.size === 0) {
            return true;
        }
        
        const matchesLaws = currentLaws.size === 0 || 
            [...currentLaws].some(law => rule[law]);
        
        const matchesClauses = currentClauses.size === 0 ||
            [...currentClauses].some(clauseWithLaw => {
                const clause = clauseWithLaw.split(" (")[0];
                const law = clauseWithLaw.split(" (")[1].slice(0, -1);
                return rule[law] && rule[law].toString().includes(clause);
            });
        
        const matchesSeverity = currentSeverities.size === 0 || 
            (rule["위험도"] && currentSeverities.has(rule["위험도"].toLowerCase()));

        if (matchesLaws && matchesClauses && matchesSeverity && 
            rule["Primary"] === "Essential") {
            selectedChecks.add(rule["Checks"]);
        }
        
        return matchesLaws && matchesClauses && matchesSeverity;
    });
    
    renderRules(filteredRules);
}


function renderRules(rules) {
    
    const container = document.getElementById("rulesContainer");
    container.innerHTML = "";
    
    if (rules.length === 0) {
        container.innerHTML = '<div class="alert alert-warning text-center">선택된 필터에 해당하는 룰이 없습니다.</div>';
        return;
    }
    
    const groupedRules = rules.reduce((acc, rule) => {
        const service = rule["서비스"] || "기타";
        if (!acc[service]) acc[service] = [];
        acc[service].push(rule);
        return acc;
    }, {});
    
    Object.entries(groupedRules).forEach(([service, serviceRules]) => {
        const serviceSection = document.createElement("div");
        serviceSection.className = "service-section";
        serviceSection.id = service.toLowerCase(); // 이 부분을 추가
        
        const serviceTitle = document.createElement("h2");
        serviceTitle.className = "text-primary mb-3";
        serviceTitle.textContent = service.toUpperCase();
        serviceSection.appendChild(serviceTitle);
        
        serviceRules.forEach(rule => {
            const ruleDiv = document.createElement("div");
            ruleDiv.className = "rule-item p-3 mb-3";
            
            // 룰 헤더 컨테이너
            const ruleHeader = document.createElement("div");
            ruleHeader.className = "rule-header d-flex justify-content-between align-items-start";
            
            // 왼쪽 영역 (체크박스와 룰 정보)
            const leftSection = document.createElement("div");
            leftSection.className = "d-flex align-items-start flex-grow-1";
            
            // 체크박스 영역
            const checkboxArea = document.createElement("div");
            checkboxArea.className = "me-3";
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = createSafeId('rule', rule["Checks"]);
            checkbox.className = "form-check-input";
            checkbox.checked = selectedChecks.has(rule["Checks"]) || rule["Primary"] === "Essential";
            checkbox.disabled = rule["Primary"] === "Essential";
            
            checkboxArea.appendChild(checkbox);
            
            // 룰 정보 영역
            const ruleInfo = document.createElement("div");
            ruleInfo.className = "rule-info flex-grow-1";

            // 룰 이름과 태그들을 포함하는 상단 라인
            const ruleNameLine = document.createElement("div");
            ruleNameLine.className = "d-flex align-items-center justify-content-between mb-2";

            // 룰 이름
            const ruleName = document.createElement("div");
            ruleName.className = "rule-name";
            ruleName.textContent = rule["Checks"];

            // 태그 컨테이너 (위험도와 MITRE ATT&CK)
            const tagContainer = document.createElement("div");
            tagContainer.className = "d-flex align-items-center gap-2";

            // 위험도 태그
            const severityTag = document.createElement("span");
            severityTag.className = `severity-tag severity-${rule["위험도"].toLowerCase()}`;
            severityTag.textContent = rule["위험도"];
            tagContainer.appendChild(severityTag);


            // MITRE ATT&CK 태그 (있는 경우에만)
            if (rule["Mitre Att&ck"]) {
                const mitreTag = document.createElement("span");
                mitreTag.className = "mitre-tag";
                mitreTag.innerHTML = `
                    <i class="bi bi-bullseye me-1"></i>
                    ${rule["Mitre Att&ck"]}
                `;
                tagContainer.appendChild(mitreTag);
            }

            ruleNameLine.appendChild(ruleName);
            ruleNameLine.appendChild(tagContainer);
            ruleInfo.appendChild(ruleNameLine);

            // 카테고리 태그들
            const categoryContainer = document.createElement("div");
            categoryContainer.className = "category-container mt-2";

            const categories = rule["카테고리"].split(',').map(cat => cat.trim());
            categories.forEach(category => {
                const categoryTag = document.createElement("span");
                categoryTag.className = "category-tag";
                categoryTag.style.backgroundColor = getCategoryColor(category);
                categoryTag.innerHTML = `
                    <i class="bi bi-tag-fill me-1"></i>
                    ${category}
                `;
                categoryContainer.appendChild(categoryTag);
            });

            ruleInfo.appendChild(categoryContainer);
            leftSection.appendChild(checkboxArea);
            leftSection.appendChild(ruleInfo);
            
            
            // 오른쪽 영역 (상세정보 버튼)
            const detailsButton = document.createElement("button");
            detailsButton.type = "button";
            detailsButton.className = "details-toggle-btn ms-3";
            detailsButton.innerHTML = `
                <span class="details-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </span>
                <span class="details-text">상세 정보</span>
            `;
            
            ruleHeader.appendChild(leftSection);
            ruleHeader.appendChild(detailsButton);
            ruleDiv.appendChild(ruleHeader);
            
            // 상세 정보 컨테이너
            const details = document.createElement("div");
            details.className = "rule-details mt-3";
            details.style.display = "none";
            
            // 관련 법률 정보 수집
            const relatedLaws = [];
            const laws = ["GDPR", "CCPA", "개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
            laws.forEach(law => {
                if (rule[law]) {
                    relatedLaws.push({
                        name: law,
                        articles: rule[law].toString().split(/[\s,]+/).filter(Boolean)
                    });
                }
            });
            
            details.innerHTML = `
                <table class="table table-bordered mb-0">
                    <tbody>
                        <tr>
                            <th style="width: 20%">룰 설명:</th>
                            <td>${rule["룰 설명"]}</td>
                        </tr>
                        <tr>
                            <th>조치 방안:</th>
                            <td>${formatActions(rule["조치 방안"])}</td>
                        </tr>
                        <tr>
                            <th>카테고리:</th>
                            <td>${rule["카테고리"]}</td>
                        </tr>
                        <tr>
                            <th>관련 법률:</th>
                            <td>
                                ${relatedLaws.map(law => `
                                    <div class="law-item mb-2">
                                        <span class="badge bg-primary me-2">${law.name}</span>
                                        <span class="law-articles">
                                            ${law.articles.map(article => 
                                                `<span class="badge bg-secondary me-1">${article}</span>`
                                            ).join('')}
                                        </span>
                                    </div>
                                `).join('')}
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
            
            ruleDiv.appendChild(details);
            
            // 클릭 이벤트 처리
            leftSection.addEventListener("click", (e) => {
                if (!checkbox.disabled && e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event("change"));
                }
            });
            
            checkbox.addEventListener("change", (e) => {
                e.stopPropagation();
                if (checkbox.checked) {
                    selectedChecks.add(rule["Checks"]);
                } else {
                    // Essential이 아닌 경우에만 삭제
                    if (rule["Primary"] !== "Essential") {
                        selectedChecks.delete(rule["Checks"]);
                    } else {
                        // Essential인 경우 체크 상태 유지
                        checkbox.checked = true;
                    }
                }
            });
            
            detailsButton.addEventListener("click", (e) => {
                e.stopPropagation();
                const isVisible = details.style.display !== "none";
                details.style.display = isVisible ? "none" : "block";
                detailsButton.classList.toggle("active");
                detailsButton.querySelector(".details-icon svg").style.transform = 
                    isVisible ? "rotate(0deg)" : "rotate(45deg)";
            });
            
            serviceSection.appendChild(ruleDiv);
        });
        
        container.appendChild(serviceSection);
    });
}

// 위험도 클래스 헬퍼 함수
function getSeverityClass(severity) {
    switch (severity.toLowerCase()) {
        case 'critical': return 'severity-critical';
        case 'high': return 'severity-high';
        case 'medium': return 'severity-medium';
        case 'low': return 'severity-low';
        default: return 'severity-default';
    }
}

function getSeverityClass(severity) {
    switch (severity.toLowerCase()) {
        case 'critical':
            return 'severity-critical';
        case 'high':
            return 'severity-high';
        case 'medium':
            return 'severity-medium';
        case 'low':
            return 'severity-low';
        default:
            return 'severity-default';
    }
}

// 룰 상세 정보 생성
function createRuleDetails(rule) {
    const details = document.createElement("div");
    details.className = "rule-details";
    details.style.display = "none";
    
    const relatedLaws = [];
    const laws = ["GDPR", "CCPA", "개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
    
    laws.forEach(law => {
        if (rule[law]) {
            relatedLaws.push({
                name: law,
                articles: rule[law].toString().split(/[\s,]+/).filter(Boolean)
            });
        }
    });
    
    details.innerHTML = `
        <table class="table table-bordered">
            <tbody>
                <tr>
                    <th style="width: 20%">룰 설명:</th>
                    <td>${rule["룰 설명"]}</td>
                </tr>
                <tr>
                    <th>조치 방안:</th>
                    <td>${formatActions(rule["조치 방안"])}</td>
                </tr>
                <tr>
                    <th>카테고리:</th>
                    <td>${rule["카테고리"]}</td>
                </tr>
                <tr>
                    <th>관련 법률:</th>
                    <td>
                        ${relatedLaws.map(law => `
                            <div class="law-item mb-2">
                                <span class="badge bg-primary me-2">${law.name}</span>
                                <span class="law-articles">
                                    ${law.articles.map(article => 
                                        `<span class="badge bg-secondary me-1">${article}</span>`
                                    ).join('')}
                                </span>
                            </div>
                        `).join('')}
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    
    return details;
}



// JSON 출력 생성
// generateJsonOutput 함수 수정
function generateJsonOutput(selectedRules, selectedLaw) {
    return new Promise((resolve) => {
        const output = {
            Framework: getFrameworkName(selectedLaw),
            Version: "",
            Provider: "AWS",
            Description: "",
            Requirements: []
        };

        // 선택된 룰들을 법률 관련 룰과 무관한 룰로 분류
        const relatedRules = [];
        const unrelatedRules = [];
        
        selectedRules.forEach(ruleId => {
            const rule = allRules.find(r => r["Checks"] === ruleId);
            if (rule) {
                if (selectedLaw === "개인정보보호법_통합") {
                    const koreanLaws = ["개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
                    const hasRelatedLaw = koreanLaws.some(law => rule[law]);
                    if (hasRelatedLaw) {
                        relatedRules.push(ruleId);
                    } else {
                        unrelatedRules.push(ruleId);
                    }
                } else if (selectedLaw && rule[selectedLaw]) {
                    relatedRules.push(ruleId);
                } else {
                    unrelatedRules.push(ruleId);
                }
            }
        });

        // 관련없는 룰이 있고 법률이 선택되었을 경우 확인 모달 표시
        if (selectedLaw) {  // unrelatedRules 체크 제거
            const modalHtml = `
                <div class="modal fade" id="unrelatedRulesModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">다운로드할 서비스 선택</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="service-selection">
                                    <div class="service-checkboxes">
                                        ${getUniqueServices(selectedRules).map(service => `
                                            <div class="form-check">
                                                <input class="form-check-input service-select" 
                                                    type="checkbox" 
                                                    id="service-${service}"
                                                    value="${service}" 
                                                    checked>
                                                <label class="form-check-label" for="service-${service}">
                                                    ${service}
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                ${unrelatedRules.length > 0 ? `
                                    <hr>
                                    <p>다음 룰들은 선택하신 ${selectedLaw}와(과) 관련이 없습니다:</p>
                                    <ul>
                                        ${unrelatedRules.map(rule => `<li>${rule}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">돌아가기</button>
                                ${unrelatedRules.length > 0 ? `
                                    <button type="button" class="btn btn-warning" id="downloadExclude">조항 제외하고 다운받기</button>
                                    <button type="button" class="btn btn-primary" id="downloadInclude">조항 추가하여 다운받기</button>
                                ` : `
                                    <button type="button" class="btn btn-primary" id="downloadInclude">다운받기</button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 서비스 목록 가져오기 함수
            function getUniqueServices(rules) {
                const services = new Set();
                rules.forEach(ruleId => {
                    const rule = allRules.find(r => r["Checks"] === ruleId);
                    if (rule) {
                        const service = rule.Checks.split('_')[0].toUpperCase();
                        services.add(service);
                    }
                });
                return Array.from(services).sort();
            }

            // 기존 모달이 있다면 제거
            let existingModal = document.getElementById('unrelatedRulesModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 새 모달 추가
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            existingModal = document.getElementById('unrelatedRulesModal');
            const modal = new bootstrap.Modal(existingModal);

            // 조항 제외하고 다운받기
            
            const downloadExcludeBtn = document.getElementById('downloadExclude');
            if (downloadExcludeBtn) {
                downloadExcludeBtn.onclick = () => {
                // 선택된 서비스 가져오기
                const selectedServices = Array.from(document.querySelectorAll('.service-select:checked'))
                    .map(checkbox => checkbox.value);
                
                // 선택된 서비스의 룰만 필터링
                const filteredRelatedRules = relatedRules.filter(ruleId => {
                    const rule = allRules.find(r => r["Checks"] === ruleId);
                    const service = rule.Checks.split('_')[0].toUpperCase();
                    return selectedServices.includes(service);
                });
            
                // 관련된 룰만 처리
                if (selectedLaw === "개인정보보호법_통합") {
                    const koreanLaws = ["개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
                    filteredRelatedRules.forEach(ruleId => {
                        const rule = allRules.find(r => r["Checks"] === ruleId);
                        if (rule) {
                            koreanLaws.forEach(law => {
                                if (rule[law]) {
                                    const articles = rule[law].toString().split(/[\s,]+/).filter(Boolean);
                                    articles.forEach(article => {
                                        let requirement = output.Requirements.find(req => req.Id === article);
                                        if (!requirement) {
                                            requirement = {
                                                Id: article,
                                                Name: `${article} (${law})`,
                                                Description: "",
                                                Attributes: [{
                                                    ItemId: article,
                                                    Section: `${article} (${law})`,
                                                    Service: "aws"
                                                }],
                                                Checks: []
                                            };
                                            output.Requirements.push(requirement);
                                        }
                                        if (!requirement.Checks.includes(ruleId)) {
                                            requirement.Checks.push(ruleId);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else if (selectedLaw) {
                    const articleMap = mapRulesToArticles(filteredRelatedRules, selectedLaw);
                    articleMap.forEach((checks, article) => {
                        output.Requirements.push({
                            Id: article,
                            Name: `${article} (${selectedLaw})`,
                            Description: "",
                            Attributes: [{
                                ItemId: article,
                                Section: `${article} (${selectedLaw})`,
                                Service: "aws"
                            }],
                            Checks: Array.from(checks)
                        });
                    });
                }
                modal.hide();
                resolve(output);
            };}

            // 조항 추가하여 다운받기
            const downloadIncludeBtn = document.getElementById('downloadInclude');
            if (downloadIncludeBtn) {
                downloadIncludeBtn.onclick = () => {
                // 선택된 서비스 가져오기
                const selectedServices = Array.from(document.querySelectorAll('.service-select:checked'))
                .map(checkbox => checkbox.value);

                // 선택된 서비스의 룰만 필터링
                const filteredRelatedRules = relatedRules.filter(ruleId => {
                    const rule = allRules.find(r => r["Checks"] === ruleId);
                    const service = rule.Checks.split('_')[0].toUpperCase();
                    return selectedServices.includes(service);
                });

                const filteredUnrelatedRules = unrelatedRules.filter(ruleId => {
                    const rule = allRules.find(r => r["Checks"] === ruleId);
                    const service = rule.Checks.split('_')[0].toUpperCase();
                    return selectedServices.includes(service);
                });
                
                // 관련된 룰 처리
                if (selectedLaw === "개인정보보호법_통합") {
                    const koreanLaws = ["개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
                    filteredRelatedRules.forEach(ruleId => {
                        const rule = allRules.find(r => r["Checks"] === ruleId);
                        if (rule) {
                            koreanLaws.forEach(law => {
                                if (rule[law]) {
                                    const articles = rule[law].toString().split(/[\s,]+/).filter(Boolean);
                                    articles.forEach(article => {
                                        let requirement = output.Requirements.find(req => req.Id === article);
                                        if (!requirement) {
                                            requirement = {
                                                Id: article,
                                                Name: `${article} (${law})`,
                                                Description: "",
                                                Attributes: [{
                                                    ItemId: article,
                                                    Section: `${article} (${law})`,
                                                    Service: "aws"
                                                }],
                                                Checks: []
                                            };
                                            output.Requirements.push(requirement);
                                        }
                                        if (!requirement.Checks.includes(ruleId)) {
                                            requirement.Checks.push(ruleId);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else if (selectedLaw) {
                    const articleMap = mapRulesToArticles(filteredRelatedRules, selectedLaw);
                    articleMap.forEach((checks, article) => {
                        output.Requirements.push({
                            Id: article,
                            Name: `${article} (${selectedLaw})`,
                            Description: "",
                            Attributes: [{
                                ItemId: article,
                                Section: `${article} (${selectedLaw})`,
                                Service: "aws"
                            }],
                            Checks: Array.from(checks)
                        });
                    });
                }

                // 관련 없는 룰들은 Custom으로 처리
                if (filteredUnrelatedRules.length > 0) {
                    output.Requirements.push({
                        Id: "custom",
                        Name: "Custom Rules",
                        Description: "",
                        Attributes: [{
                            ItemId: "custom",
                            Section: "Custom Rules",
                            Service: "aws"
                        }],
                        Checks: filteredUnrelatedRules
                    });
                }
                
                modal.hide();
                resolve(output);
            };

            // 모달 닫기 시 처리 취소
            existingModal.addEventListener('hidden.bs.modal', () => {
                resolve(null);
            });}

            modal.show();
        } else {
            // 관련 없는 룰이 없는 경우 정상 처리
            if (selectedLaw === "개인정보보호법_통합") {
                const koreanLaws = ["개인정보보호법", "개보법 시행령", "안전성 확보조치 기준"];
                selectedRules.forEach(ruleId => {
                    const rule = allRules.find(r => r["Checks"] === ruleId);
                    if (rule) {
                        koreanLaws.forEach(law => {
                            if (rule[law]) {
                                const articles = rule[law].toString().split(/[\s,]+/).filter(Boolean);
                                articles.forEach(article => {
                                    let requirement = output.Requirements.find(req => req.Id === article);
                                    if (!requirement) {
                                        requirement = {
                                            Id: article,
                                            Name: `${article} (${law})`,
                                            Description: "",
                                            Attributes: [{
                                                ItemId: article,
                                                Section: `${article} (${law})`,
                                                Service: "aws"
                                            }],
                                            Checks: []
                                        };
                                        output.Requirements.push(requirement);
                                    }
                                    if (!requirement.Checks.includes(ruleId)) {
                                        requirement.Checks.push(ruleId);
                                    }
                                });
                            }
                        });
                    }
                });
            } else if (selectedLaw) {
                const articleMap = mapRulesToArticles(selectedRules, selectedLaw);
                articleMap.forEach((checks, article) => {
                    output.Requirements.push({
                        Id: article,
                        Name: `${article} (${selectedLaw})`,
                        Description: "",
                        Attributes: [{
                            ItemId: article,
                            Section: `${article} (${selectedLaw})`,
                            Service: "aws"
                        }],
                        Checks: Array.from(checks)
                    });
                });
            } else {
                output.Requirements.push({
                    Id: "custom",
                    Name: "Custom Rules",
                    Description: "",
                    Attributes: [{
                        ItemId: "custom",
                        Section: "Custom Rules",
                        Service: "aws"
                    }],
                    Checks: selectedRules
                });
            }
            resolve(output);
        }
    });
}

// 다운로드 버튼 이벤트 리스너 수정
document.getElementById("submitBtn").addEventListener("click", async () => {
    const selectedLaw = document.getElementById("lawSelect").value;
    
    // 법률 포맷 선택 검증 (!selectedLaw 조건 추가)
    if (selectedLaw === '법률 포맷 선택' || !selectedLaw) {
        const lawSelect = document.getElementById("lawSelect");
        const lawSelectRect = lawSelect.getBoundingClientRect();
        
        // 토스트 HTML
        const toastHtml = `
            <div class="toast align-items-center bg-warning border-0" 
                 style="position: absolute; 
                        top: ${-40}px;
                        left: 0;
                        right: 0;
                        margin: auto;
                        width: fit-content;" 
                 role="alert" 
                 aria-live="assertive" 
                 aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body text-dark">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        법률 포맷을 선택하여야합니다.
                    </div>
                </div>
            </div>
        `;

        // 기존 토스트 제거
        const existingToast = lawSelect.parentElement.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 토스트를 select 요소의 부모에 추가
        lawSelect.parentElement.insertAdjacentHTML('beforeend', toastHtml);

        // 토스트 표시
        const toastElement = lawSelect.parentElement.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        toast.show();

        return;
    }

    const essentialRules = allRules
        .filter(rule => rule["Primary"] === "Essential")
        .map(rule => rule["Checks"]);
    
    const selectedRules = [...new Set([...selectedChecks, ...essentialRules])];

    // 기존 모달이 있다면 제거
    const existingModal = document.getElementById('unrelatedRulesModal');
    if (existingModal) {
        const modalInstance = bootstrap.Modal.getInstance(existingModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
        existingModal.remove();
    }
    
    try {
        const data = await generateJsonOutput(selectedRules, selectedLaw);
        if (data) {
            downloadJson(data, selectedLaw);
        }
    } catch (error) {
        console.error("Error generating JSON:", error);
    }
});

// JSON 다운로드 헬퍼 함수
function downloadJson(data, selectedLaw) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `compliance_rules_${selectedLaw || 'custom'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// 프레임워크 이름 가져오기
function getFrameworkName(selectedLaw) {
    switch(selectedLaw) {
        case "개인정보보호법_통합":
            return "PIPA";
        case "GDPR":
            return "GDPR";
        case "CCPA":
            return "CCPA";
        default:
            return "Custom Framework";
    }
}

// 룰을 조항에 매핑
function mapRulesToArticles(selectedRules, selectedLaw) {
    const articleMap = new Map();
    
    selectedRules.forEach(ruleId => {
        const rule = allRules.find(r => r["Checks"] === ruleId);
        if (rule && rule[selectedLaw]) {
            const articles = rule[selectedLaw].toString().split(/[\s,]+/).filter(Boolean);
            articles.forEach(article => {
                if (!articleMap.has(article)) {
                    articleMap.set(article, new Set());
                }
                articleMap.get(article).add(ruleId);
            });
        }
    });
    
    return articleMap;
}

// 페이지 로드 시 모달 표시 여부 확인
document.addEventListener('DOMContentLoaded', () => {
    const dontShowAgain = localStorage.getItem('dontShowIntro');
    if (!dontShowAgain) {
        const introModal = new bootstrap.Modal(document.getElementById('introModal'));
        introModal.show();
    }
    // 다운로드 버튼 스크롤 기능
    const scrollToDownloadBtn = document.getElementById('scrollToDownloadBtn');
    if (scrollToDownloadBtn) {
        scrollToDownloadBtn.addEventListener('click', () => {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        });
    }
});

// 다시 보지 않기 체크박스 처리
document.getElementById('dontShowAgain').addEventListener('change', (e) => {
    if (e.target.checked) {
        localStorage.setItem('dontShowIntro', 'true');
    } else {
        localStorage.removeItem('dontShowIntro');
    }
});

function groupRulesByService() {
    const serviceGroups = {};
    
    allRules.forEach(rule => {
        const serviceName = rule.Checks.split('_')[0].toUpperCase();
        if (!serviceGroups[serviceName]) {
            serviceGroups[serviceName] = [];
        }
        serviceGroups[serviceName].push(rule);
    });
    
    // 사이드바 업데이트
    updateServiceSidebar(serviceGroups);
    return serviceGroups;
}

function updateServiceSidebar(serviceGroups) {
    const serviceList = document.getElementById('serviceList');
    if (!serviceList) return;
    
    serviceList.innerHTML = '';
    
    // 헤더에 클릭 이벤트 추가
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
        sidebarHeader.addEventListener('click', () => {
            // 모든 서비스 링크에서 active 클래스 제거
            document.querySelectorAll('.service-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // 맨 위로 스크롤
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // 서비스 이름으로 정렬
    Object.keys(serviceGroups)
        .sort()
        .forEach(serviceName => {
            const li = document.createElement('li');
            li.className = 'service-item';
            
            const link = document.createElement('a');
            link.href = `#${serviceName.toLowerCase()}`;
            link.className = 'service-link';
            link.textContent = `${serviceName} (${serviceGroups[serviceName].length})`;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 모든 링크에서 active 클래스 제거
                document.querySelectorAll('.service-link').forEach(l => l.classList.remove('active'));
                // 클릭된 링크에 active 클래스 추가
                link.classList.add('active');
                
                // 해당 서비스의 첫 번째 룰로 스크롤
                const targetSection = document.getElementById(serviceName.toLowerCase());
                if (targetSection) {
                    // 헤더 높이를 고려한 오프셋 계산 (필요에 따라 조정)
                    const headerOffset = 120;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // 해당 서비스의 첫 번째 룰에 포커스 효과 추가 (선택사항)
                    const firstRule = targetSection.querySelector('.rule-item');
                    if (firstRule) {
                        firstRule.classList.add('highlight');
                        setTimeout(() => {
                            firstRule.classList.remove('highlight');
                        }, 2000); // 2초 후 하이라이트 효과 제거
                    }
                }
            });
            
            li.appendChild(link);
            serviceList.appendChild(li);
        });
}


function formatActions(actions) {
    if (!actions) return '';
    
    // IP 주소 패턴을 감지하고 특별한 스타일을 적용
    const formattedText = actions.replace(
        /\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/g, 
        match => `<span class="ip-address">${match}</span>`
    );

    // 번호가 있는 텍스트를 리스트로 변환
    const steps = formattedText.split(/(?=\d+\.\s)/).filter(step => step.trim());
    
    if (steps.length > 1) {
        return `<ul class="action-steps">
            ${steps.map(step => `<li>${step.replace(/^\d+\.\s/, '')}</li>`).join('')}
        </ul>`;
    }
    
    return formattedText;
}

// 드롭다운 스타일 적용
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .law-select-container {
            position: relative;
            width: 400px;
            margin: 30px auto;
        }
        
        #lawSelect {
            width: 100%;
            padding: 15px 20px;
            font-size: 16px;
            font-weight: 500;
            color: #333;
            background-color: #fff;
            border: 2px solid #0056b3;
            border-radius: 8px;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
        }
        
        .law-select-container::after {
            content: '';
            position: absolute;
            right: 15px;
            top: 50%;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #0056b3;
            transform: translateY(-50%);
            pointer-events: none;
        }
        
        #submitBtn {
            display: block;
            width: 400px;
            margin: 20px auto;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: 500;
            color: #fff;
            background-color: #0056b3;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        #submitBtn:hover {
            background-color: #004494;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    </style>
`);