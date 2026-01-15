import {CommonModule, isPlatformBrowser, DOCUMENT} from "@angular/common";
import {Component, ElementRef, OnDestroy, ViewChild, OnInit, ChangeDetectorRef} from "@angular/core";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzAvatarModule} from "ng-zorro-antd/avatar";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzTimelineModule} from "ng-zorro-antd/timeline";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzMessageModule, NzMessageService} from "ng-zorro-antd/message";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {NzModalModule} from "ng-zorro-antd/modal";
import {Inject, PLATFORM_ID} from "@angular/core";
import {JitsiService} from '../../shared/services/jitsi.service';

type RiskLevel = "low" | "medium" | "high";

type AiImpactLevel = "high" | "medium" | "low";

interface SelectOption {
  value: string;
  label: string;
}

interface PatientProfile {
  id: string;
  fullName: string;
  birthDate: Date;
  contactPhone: string;
  email: string;
  iin: string;
  department: string;
  position: string;
  personnelNumber: string;
  attendingDoctor: string;
  lastVisit: Date;
  nextVisit: Date;
  riskFactors: string[];
  photo: string;
}

interface PatientVisitTimelineEvent {
  date: Date;
  title: string;
  details: string;
  color: "blue" | "green" | "red";
}

interface PatientVisitFormValue {
  history: {
    chronicDiseases: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
    historyNotes: string;
  };
  current: {
    complaints: string;
    objectiveStatus: string;
    diagnosis: string;
    treatmentPlan: string;
    recommendations: string;
    vitals: {
      temperature: number;
      pulse: number;
      systolic: number;
      diastolic: number;
      spo2: number;
      respiratoryRate: number;
    };
  };
  lifestyle: {
    activityLevel: string;
    sleepQuality: string;
    stressLevel: string;
    nutrition: string;
  };
}

interface VitalMetricConfig {
  control: keyof PatientVisitFormValue["current"]["vitals"];
  unit: string;
  step: number;
  min: number;
  max: number;
  labelKey: string;
}

interface AiTrigger {
  labelKey: string;
  detailKey: string;
  impact: AiImpactLevel;
}

interface AiFollowUp {
  titleKey: string;
  dueKey: string;
}

interface AiAnalysis {
  assistantName: string;
  updatedAt: Date;
  riskScore: number;
  riskLevel: RiskLevel;
  summaryKey: string;
  triggers: AiTrigger[];
  recommendations: string[];
  followUps: AiFollowUp[];
}

type TelemedStatus = "scheduled" | "live" | "ended";

interface TelemedSession {
  id: string;
  status: TelemedStatus;
  platform: string;
  scheduledAt: Date;
  durationMinutes: number;
  channel: string;
  pin: string;
  doctorSide: string;
  patientSide: string;
  paramedicName: string;
  device: string;
  noteKey: string;
}

@Component({
  selector: "app-patient-visit",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    NzCardModule,
    NzAvatarModule,
    NzTagModule,
    NzTimelineModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzInputNumberModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzMessageModule,
    NzFormModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
  ],
  templateUrl: "./patient-visit.component.html",
  styleUrl: "./patient-visit.component.less",
})
export class PatientVisitComponent implements OnInit, OnDestroy {
  @ViewChild("jitsiContainer") jitsiContainer?: ElementRef<HTMLDivElement>;
  readonly visitForm: FormGroup;
  lastSavedAt: Date | null = null;
  isSaving = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private jitsiApi: any = null;
  showTelemedCall = false;
  isTelemedModalVisible = false;
  private readonly jitsiDomain = "jitsi-meet.yurtech.kz";
  jitsiReady = false;
  isMicMuted = false;
  isVideoMuted = false;
  isFullscreen = false;

  private fullscreenHandler = () => {
    const nativeFullscreen =
      this.document.fullscreenElement ||
      (this.document as any).webkitFullscreenElement ||
      (this.document as any).mozFullScreenElement;
    if (!nativeFullscreen) {
      this.isFullscreen = false;
    }
  };

  readonly patientProfile: PatientProfile = {
    id: "patient-1223",
    fullName: "Жумабекова Айгуль Ерлановна",
    birthDate: new Date("1986-04-12"),
    contactPhone: "+7 701 222 33 44",
    email: "a.zhumabekova@example.com",
    iin: "860412300123",
    department: "Производство / Цех №4",
    position: "Мастер смены",
    personnelNumber: "004512",
    attendingDoctor: "Д-р А. Сагындык",
    lastVisit: new Date("2024-11-22T09:40:00"),
    nextVisit: new Date("2025-01-15T09:00:00"),
    riskFactors: ["Гипертония II ст.", "Сидячая работа", "Низкая активность"],
    photo: "assets/images/avatars/10-3.jpg",
  };

  readonly visitTimeline: PatientVisitTimelineEvent[] = [
    {
      date: new Date("2024-11-22T09:40:00"),
      title: "Контрольное обследование",
      details: "АД 138/86, нормализация сахара после корректировки терапии.",
      color: "blue",
    },
    {
      date: new Date("2024-10-08T08:50:00"),
      title: "Жалобы на головные боли",
      details:
        "Повышенное давление после ночной смены, назначено дообследование.",
      color: "red",
    },
    {
      date: new Date("2024-08-19T10:15:00"),
      title: "Плановый профосмотр",
      details: "Без жалоб, рекомендована ходьба не менее 6 000 шагов в день.",
      color: "green",
    },
  ];

  readonly chronicDiseaseOptions: SelectOption[] = [
    {
      value: "hypertension",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.DISEASES.HYPERTENSION",
    },
    {
      value: "diabetes",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.DISEASES.DIABETES",
    },
    {
      value: "asthma",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.DISEASES.ASTHMA",
    },
    {
      value: "ibs",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.DISEASES.IBS",
    },
    {
      value: "osteochondrosis",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.DISEASES.OSTEOCHONDROSIS",
    },
  ];

  readonly allergyOptions: SelectOption[] = [
    {
      value: "penicillin",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.ALLERGIES_OPTIONS.PENICILLIN",
    },
    {
      value: "nsaids",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.ALLERGIES_OPTIONS.NSAIDS",
    },
    {
      value: "seasonal",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.ALLERGIES_OPTIONS.SEASONAL",
    },
  ];

  readonly medicationOptions: SelectOption[] = [
    {
      value: "enalapril",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.MEDICATIONS_OPTIONS.ENALAPRIL",
    },
    {
      value: "metformin",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.MEDICATIONS_OPTIONS.METFORMIN",
    },
    {
      value: "atorvastatin",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.MEDICATIONS_OPTIONS.ATORVASTATIN",
    },
  ];

  readonly surgeryOptions: SelectOption[] = [
    {
      value: "appendectomy_2010",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.SURGERIES_OPTIONS.APPENDECTOMY",
    },
    {
      value: "cholecystectomy_2018",
      label:
        "MEDICAL_DATA.PATIENT_VISIT.HISTORY.SURGERIES_OPTIONS.CHOLECYSTECTOMY",
    },
    {
      value: "none",
      label: "MEDICAL_DATA.PATIENT_VISIT.HISTORY.SURGERIES_OPTIONS.NONE",
    },
  ];

  readonly activityOptions: SelectOption[] = [
    {
      value: "low",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.ACTIVITY_OPTIONS.LOW",
    },
    {
      value: "moderate",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.ACTIVITY_OPTIONS.MODERATE",
    },
    {
      value: "high",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.ACTIVITY_OPTIONS.HIGH",
    },
  ];

  readonly sleepOptions: SelectOption[] = [
    {
      value: "unstable",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.SLEEP_OPTIONS.UNSTABLE",
    },
    {
      value: "stable",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.SLEEP_OPTIONS.STABLE",
    },
    {
      value: "insomnia",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.SLEEP_OPTIONS.INSOMNIA",
    },
  ];

  readonly stressOptions: SelectOption[] = [
    {
      value: "low",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.STRESS_OPTIONS.LOW",
    },
    {
      value: "medium",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.STRESS_OPTIONS.MEDIUM",
    },
    {
      value: "high",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.STRESS_OPTIONS.HIGH",
    },
  ];

  readonly nutritionOptions: SelectOption[] = [
    {
      value: "balanced",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.NUTRITION_OPTIONS.BALANCED",
    },
    {
      value: "irregular",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.NUTRITION_OPTIONS.IRREGULAR",
    },
    {
      value: "highSugar",
      label: "MEDICAL_DATA.PATIENT_VISIT.LIFESTYLE.NUTRITION_OPTIONS.HIGH_SUGAR",
    },
  ];

  readonly historyTemplates: string[] = [
    "Хронические заболевания компенсированы, эпизодических кризов не отмечает.",
    "Сезонная аллергия на цветение, использует антигистаминные по необходимости.",
  ];

  readonly complaintTemplates: string[] = [
    "Пульсирующие головные боли после ночной смены, слабость, утомляемость.",
    "Головокружение при резком вставании, эпизоды онемения пальцев.",
  ];

  readonly objectiveTemplates: string[] = [
    "Сознание ясное, кожа чистая, отеков нет. Тоны сердца приглушены, хрипов нет.",
    "Легкая пастозность голеней, дыхание везикулярное, живот мягкий безболезненный.",
  ];

  readonly planTemplates: string[] = [
    "Скорректировать дозу Эналаприла до 10 мг 2 раза в сутки, контроль через 2 недели.",
    "Добавить дневные прогулки не менее 20 минут, вести дневник давления.",
  ];

  readonly vitalsConfig: VitalMetricConfig[] = [
    {
      control: "temperature",
      unit: "°C",
      step: 0.1,
      min: 34,
      max: 42,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.TEMPERATURE",
    },
    {
      control: "pulse",
      unit: "уд/мин",
      step: 1,
      min: 30,
      max: 220,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.PULSE",
    },
    {
      control: "systolic",
      unit: "мм рт. ст.",
      step: 1,
      min: 60,
      max: 260,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.SYSTOLIC",
    },
    {
      control: "diastolic",
      unit: "мм рт. ст.",
      step: 1,
      min: 30,
      max: 180,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.DIASTOLIC",
    },
    {
      control: "spo2",
      unit: "%",
      step: 1,
      min: 70,
      max: 100,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.SPO2",
    },
    {
      control: "respiratoryRate",
      unit: "вдох/мин",
      step: 1,
      min: 8,
      max: 40,
      labelKey: "MEDICAL_DATA.PATIENT_VISIT.VITALS.RESPIRATORY",
    },
  ];

  readonly aiAnalysis: AiAnalysis = {
    assistantName: "MED-Assist",
    updatedAt: new Date("2024-11-22T10:05:00"),
    riskScore: 72,
    riskLevel: "medium",
    summaryKey: "MEDICAL_DATA.PATIENT_VISIT.AI.SUMMARY",
    triggers: [
      {
        labelKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.BLOOD_PRESSURE",
        detailKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.BLOOD_PRESSURE_HINT",
        impact: "high",
      },
      {
        labelKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.SLEEP_DEBT",
        detailKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.SLEEP_DEBT_HINT",
        impact: "medium",
      },
      {
        labelKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.ACTIVITY",
        detailKey: "MEDICAL_DATA.PATIENT_VISIT.AI.TRIGGERS.ACTIVITY_HINT",
        impact: "medium",
      },
    ],
    recommendations: [
      "MEDICAL_DATA.PATIENT_VISIT.AI.RECOMMENDATIONS.MEDICATION",
      "MEDICAL_DATA.PATIENT_VISIT.AI.RECOMMENDATIONS.MONITORING",
      "MEDICAL_DATA.PATIENT_VISIT.AI.RECOMMENDATIONS.LIFESTYLE",
    ],
    followUps: [
      {
        titleKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.ABPM",
        dueKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.ABPM_DUE",
      },
      {
        titleKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.BIOCHEMISTRY",
        dueKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.BIOCHEMISTRY_DUE",
      },
      {
        titleKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.CONSULT",
        dueKey: "MEDICAL_DATA.PATIENT_VISIT.AI.FOLLOWUPS.CONSULT_DUE",
      },
    ],
  };

  readonly telemedSession: TelemedSession = {
    id: "tm-9082",
    status: "scheduled",
    platform: "MED Telemed",
    scheduledAt: new Date("2024-11-22T10:30:00"),
    durationMinutes: 30,
    channel: "Room 4B · Камера 02",
    pin: "483-221",
    doctorSide: "Д-р А. Сагындык",
    patientSide: "Цех №4 · пост 12",
    paramedicName: "Фельдшер С. Абдурахман",
    device: "Samsung Tab Active 4",
    noteKey: "MEDICAL_DATA.PATIENT_VISIT.TELEMED.NOTE",
  };

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private translate: TranslateService,
    private jitsiService: JitsiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    const initialValue = this.getInitialFormValue();
    this.visitForm = this.fb.group({
      history: this.fb.group({
        chronicDiseases: [initialValue.history.chronicDiseases],
        allergies: [initialValue.history.allergies],
        medications: [initialValue.history.medications],
        surgeries: [initialValue.history.surgeries],
        historyNotes: [
          initialValue.history.historyNotes,
          [Validators.required, Validators.minLength(8)],
        ],
      }),
      current: this.fb.group({
        complaints: [
          initialValue.current.complaints,
          [Validators.required, Validators.minLength(6)],
        ],
        objectiveStatus: [
          initialValue.current.objectiveStatus,
          [Validators.required, Validators.minLength(6)],
        ],
        diagnosis: [
          initialValue.current.diagnosis,
          [Validators.required, Validators.minLength(4)],
        ],
        treatmentPlan: [
          initialValue.current.treatmentPlan,
          [Validators.required, Validators.minLength(6)],
        ],
        recommendations: [initialValue.current.recommendations],
        vitals: this.fb.group({
          temperature: [
            initialValue.current.vitals.temperature,
            [Validators.min(34), Validators.max(42)],
          ],
          pulse: [
            initialValue.current.vitals.pulse,
            [Validators.min(40), Validators.max(200)],
          ],
          systolic: [
            initialValue.current.vitals.systolic,
            [Validators.min(60), Validators.max(260)],
          ],
          diastolic: [
            initialValue.current.vitals.diastolic,
            [Validators.min(30), Validators.max(180)],
          ],
          spo2: [
            initialValue.current.vitals.spo2,
            [Validators.min(70), Validators.max(100)],
          ],
          respiratoryRate: [
            initialValue.current.vitals.respiratoryRate,
            [Validators.min(8), Validators.max(40)],
          ],
        }),
      }),
      lifestyle: this.fb.group({
        activityLevel: [initialValue.lifestyle.activityLevel],
        sleepQuality: [initialValue.lifestyle.sleepQuality],
        stressLevel: [initialValue.lifestyle.stressLevel],
        nutrition: [initialValue.lifestyle.nutrition],
      }),
    });
  }

  ngOnDestroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.endTelemedCall();
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener(
        "fullscreenchange",
        this.fullscreenHandler,
      );
      this.document.removeEventListener(
        "webkitfullscreenchange",
        this.fullscreenHandler,
      );
      this.document.removeEventListener(
        "mozfullscreenchange",
        this.fullscreenHandler,
      );
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.addEventListener("fullscreenchange", this.fullscreenHandler);
    this.document.addEventListener(
      "webkitfullscreenchange",
      this.fullscreenHandler,
    );
    this.document.addEventListener(
      "mozfullscreenchange",
      this.fullscreenHandler,
    );
    this.jitsiService
      .loadApi()
      .then(() => {
        this.jitsiReady = true;
      })
      .catch(() => {
        this.message.error(
          this.translate.instant("MEDICAL_DATA.PATIENT_VISIT.TELEMED.ERROR"),
        );
      });
  }

  get historyGroup(): FormGroup {
    return this.visitForm.get("history") as FormGroup;
  }

  get currentGroup(): FormGroup {
    return this.visitForm.get("current") as FormGroup;
  }

  get vitalsGroup(): FormGroup {
    return this.visitForm.get("current.vitals") as FormGroup;
  }

  get clinicalRiskLevel(): RiskLevel {
    const vitals = this.vitalsGroup?.value;
    if (!vitals) {
      return "low";
    }
    if (
      vitals.systolic >= 150 ||
      vitals.diastolic >= 95 ||
      vitals.spo2 <= 94 ||
      vitals.temperature >= 38.5
    ) {
      return "high";
    }
    if (
      vitals.systolic >= 135 ||
      vitals.diastolic >= 90 ||
      vitals.spo2 <= 96 ||
      vitals.temperature >= 37.5
    ) {
      return "medium";
    }
    return "low";
  }

  resetForm(): void {
    this.visitForm.reset(this.getInitialFormValue());
    this.visitForm.markAsPristine();
    this.visitForm.markAsUntouched();
  }

  submitVisit(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    const payload = {
      patientId: this.patientProfile.id,
      ...this.visitForm.value,
    };

    // This will be replaced by API integration later.
    console.log("Patient visit payload", payload);

    this.isSaving = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.isSaving = false;
      this.lastSavedAt = new Date();
      this.visitForm.markAsPristine();
      this.message.success(
        this.translate.instant("MEDICAL_DATA.PATIENT_VISIT.SUCCESS"),
      );
    }, 600);
  }

  appendToField(path: string, snippet: string): void {
    const control = this.visitForm.get(path);
    if (!control) {
      return;
    }
    const currentText = (control.value || "").toString();
    const glue = currentText && !currentText.endsWith(" ") ? " " : "";
    control.setValue(`${currentText}${glue}${snippet}`.trim());
    control.markAsDirty();
    control.markAsTouched();
  }

  startTelemedCall(): void {
    if (!isPlatformBrowser(this.platformId) || this.jitsiApi) {
      return;
    }
    if (!this.jitsiReady || !window.JitsiMeetExternalAPI) {
      this.message.warning(
        this.translate.instant("MEDICAL_DATA.PATIENT_VISIT.TELEMED.LOADING"),
      );
      return;
    }
    this.showTelemedCall = true;
    this.isTelemedModalVisible = true;
    this.cdr.detectChanges();
    if (!this.jitsiContainer) {
      this.message.error(
        this.translate.instant("MEDICAL_DATA.PATIENT_VISIT.TELEMED.ERROR"),
      );
      this.showTelemedCall = false;
      return;
    }
    const containerEl = this.jitsiContainer.nativeElement;
    const width =
      containerEl.getBoundingClientRect().width || window.innerWidth * 0.8;
    const height =
      containerEl.getBoundingClientRect().height || window.innerHeight * 0.6;
    const domain = this.jitsiDomain;
    const options = {
      roomName: `MIS-${this.telemedSession.id}`,
      parentNode: this.jitsiContainer.nativeElement,
      width,
      height,
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
        SHOW_CHROME_EXTENSION_BANNER: false,
        HIDE_INVITE_MORE_HEADER: true,
      },
      userInfo: {
        displayName:
        this.telemedSession.doctorSide,
      },
    };

    this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
    this.jitsiApi.executeCommand("setTileView", true);
    this.jitsiApi.executeCommand("changeLanguage", "ru");
    this.jitsiApi.addEventListener("readyToClose", () => {
      this.endTelemedCall();
    });
  }

  endTelemedCall(): void {
    if (this.jitsiApi) {
      this.jitsiApi.dispose?.();
      this.jitsiApi = null;
    }
    this.showTelemedCall = false;
    this.isTelemedModalVisible = false;
    if (this.jitsiContainer) {
      this.jitsiContainer.nativeElement.innerHTML = "";
    }
  }

  resolveMetricState(controlName: string): "danger" | "warning" | "normal" {
    const value = this.vitalsGroup?.get(controlName)?.value;
    if (value === null || value === undefined) {
      return "normal";
    }
    switch (controlName) {
      case "temperature":
        if (value >= 38.5) return "danger";
        if (value >= 37.4) return "warning";
        return "normal";
      case "pulse":
        if (value >= 110 || value <= 45) return "danger";
        if (value >= 95 || value <= 55) return "warning";
        return "normal";
      case "systolic":
        if (value >= 150) return "danger";
        if (value >= 135) return "warning";
        return "normal";
      case "diastolic":
        if (value >= 95) return "danger";
        if (value >= 90) return "warning";
        return "normal";
      case "spo2":
        if (value <= 94) return "danger";
        if (value <= 96) return "warning";
        return "normal";
      case "respiratoryRate":
        if (value >= 26 || value <= 10) return "danger";
        if (value >= 22 || value <= 12) return "warning";
        return "normal";
      default:
        return "normal";
    }
  }

  isInvalid(path: string): boolean {
    const control = this.visitForm.get(path);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private getInitialFormValue(): PatientVisitFormValue {
    return {
      history: {
        chronicDiseases: ["hypertension", "diabetes"],
        allergies: ["seasonal"],
        medications: ["enalapril", "metformin"],
        surgeries: ["appendectomy_2010"],
        historyNotes:
          "Начало заболевания около 5 лет назад. Сезонные обострения, учитывает диету.",
      },
      current: {
        complaints:
          "Головная боль к концу смены, ощущение тяжести в ногах, утомляемость.",
        objectiveStatus:
          "Кожа чистая, дыхание везикулярное, отеков нет. Тоны сердца приглушены, давление стабильное.",
        diagnosis: "Гипертоническая болезнь II ст., риск 3.",
        treatmentPlan:
          "Продолжить базовую терапию, усилить контроль АД, рекомендовать ЛФК.",
        recommendations: "Отслеживать качество сна и питьевой режим.",
        vitals: {
          temperature: 36.8,
          pulse: 78,
          systolic: 138,
          diastolic: 86,
          spo2: 97,
          respiratoryRate: 17,
        },
      },
      lifestyle: {
        activityLevel: "moderate",
        sleepQuality: "unstable",
        stressLevel: "medium",
        nutrition: "balanced",
      },
    };
  }
}

