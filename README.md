# CompRight - Prowler 룰셋 생성기

이 도구는 Apache-2.0 라이선스를 가진 Prowler와 연동되어 AWS 리소스의 규정 준수 상태를 점검하는 룰셋을 생성합니다.

## 개요

CompRight는 AWS 리소스의 규정 준수 상태를 점검하는 Prowler의 룰셋을 커스텀하고 생성할 수 있는 특화된 도구입니다.

## 주요 기능

- 법률별 규정 준수 항목 확인 (GDPR, CCPA, 개인정보보호법)
- AWS 서비스별 보안 규칙 관리
- 위험도 및 MITRE ATT&CK 프레임워크 기반 분석
- 맞춤형 규정 준수 룰셋 생성

## 사용 방법

**1. 법률 선택**
- 확인하고자 하는 법률을 선택합니다

**2. 조항 선택**
- 선택한 법률의 세부 조항을 선택합니다

**3. 룰 확인**
- 해당되는 Prowler AWS 보안 규칙을 확인합니다
- 각 룰의 상세 정보와 조치 방안을 확인합니다

**4. 룰셋 생성**
- 선택한 룰들에 대한 JSON 형식의 룰셋 파일을 다운로드합니다

## 참고 사항

**필수 룰**
- Essential로 표시된 룰은 필수 적용 항목입니다
- 다운로드 시 서비스 선택을 통해 특정 서비스의 Essential 룰도 제외 가능합니다

**위험도 분류**
- Critical, High, Medium, Low로 구분됩니다

**MITRE ATT&CK 프레임워크 적용**
- Essential 룰 선정 기준:
  - Reconnaissance 관련
  - Initial Access 관련
  - Privilege Escalation 관련

**서비스 선택**
- 다운로드 시 특정 AWS 서비스 점검 제외 가능
- 선택하지 않은 서비스의 룰은 Essential 여부와 관계없이 제외됩니다
