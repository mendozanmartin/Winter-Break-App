import { Component, OnInit } from "@angular/core";
import { Page, EventData } from "tns-core-modules/ui/page/page";
import { Course } from "~/models/course.model";
import { GradePointAverage } from "~/models/grade-point-average.model";
import { AcademicTerm } from "~/models/academic-term.model";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { RouterExtensions } from "nativescript-angular/router";
import { FirestoreService } from "~/services/firestore.service";
import { InternalStorageService } from "~/services/internal-storage.service";
import { PersistentSettings } from "~/services/persistent-settings.service";

@Component({
    selector: "ns-addition-sequence",
    templateUrl: "./addition-sequence.component.html",
    styleUrls: ["./addition-sequence.component.css"]
})
export class AdditionSequenceComponent implements OnInit {
    public course: Course;
    public grade: GradePointAverage;
    public term: AcademicTerm;

    public prompt: string =
        "Would you like to add a course or a completed term?";
    private coursePrompts: Array<string>;
    private termPrompts: Array<string>;

    public sequenceBegin: boolean = true;
    public courseOne: boolean = false;
    public courseTwo: boolean = false;
    public courseThree: boolean = false;
    public courseFour: boolean = false;

    public termOne: boolean = false;
    public termTwo: boolean = false;
    public termThree: boolean = false;

    public years: Array<number> = [];
    public seasons: Array<string> = ["Spring/Summer", "Fall", "Winter"];

    constructor(
        private page: Page,
        private router: RouterExtensions,
        private firestore: FirestoreService,
        private storage: InternalStorageService
    ) {
        this.course = new Course(); //these have to be created so that there is no error when binding to ngModel
        this.term = new AcademicTerm();

        this.page.actionBarHidden = true;
        this.coursePrompts = [
            "What is the name of your course?",
            "What is the academic term of this course?",
            "Is this course completed?",
            "What was your final GPA for this course?"
        ];
        this.termPrompts = [
            "What is the academic term?",
            "What is your final GPA for this term?"
        ];
    }

    ngOnInit() {
        const today = new Date();
        const currentYear = today.getFullYear();

        for (let i = currentYear + 1; i > currentYear - 20; i--) {
            this.years.push(i);
        }
    }
    courseSequence() {
        //1st step in course sequence
        this.sequenceBegin = false;
        this.courseOne = true;
        this.prompt = this.coursePrompts[0];
    }

    enterCourseName() {
        //2nd step in course sequence, aquire course name
        this.courseOne = false;
        this.courseTwo = true;
        this.prompt = this.coursePrompts[1];
    }

    submitAcademicPeriodCourse() {
        //3rd step in course sequence
        this.courseTwo = false;
        this.courseThree = true;
        this.prompt = this.coursePrompts[2];
    }

    enterFinalGradeCourse() {
        //4th step in the course sequence
        this.courseThree = false;
        this.courseFour = true;
        this.prompt = this.coursePrompts[3];
    }

    randomIdGenerator(): string {
        return Math.random()
            .toString(36)
            .substr(2, 9);
    }
    submitFinalGradeCourse() {
        const randomId = this.randomIdGenerator();
        this.course.cid = randomId;
        this.course.uid = PersistentSettings.token;
        this.storage.addCourse(this.course, randomId).then(data => {
            console.log(
                data === true
                    ? "Succesfully added course"
                    : "Failed to add course"
            );
        });
        this.firestore.addCourse(this.course).catch(console.error);
        this.router.navigate(["/home"]);
        //TODO: write new course to internal and external storage
    }

    termSequence() {
        //1st step in terms sequence
        this.sequenceBegin = false;
        this.termOne = true;
        this.prompt = this.termPrompts[0];
    }

    submitAcademicPeriodTerm() {
        //2nd step in the terms sequence
        this.termOne = false;
        this.prompt = this.termPrompts[1];
    }

    enterFinalGradeTerm() {
        //3rd step in the terms sequence
        this.prompt = this.termPrompts[2];
    }

    enterGradeBreakdown() {
        //TODO: navigate to grade breakdown component
        //   this.router.navigate(["/"])
    }

    public onSelectedYearChanged(args: EventData) {
        const picker = <ListPicker>args.object;
        this.course.academicYear = this.years[picker.selectedIndex];
        this.term.academicYear = this.years[picker.selectedIndex];
    }

    public onSelectedSeasonChanged(args: EventData) {
        const picker = <ListPicker>args.object;
        this.course.academicSeason = this.seasons[picker.selectedIndex];
        this.term.academicSeason = this.seasons[picker.selectedIndex];
    }

    public routeBack() {
        this.router.back();
    }
}
