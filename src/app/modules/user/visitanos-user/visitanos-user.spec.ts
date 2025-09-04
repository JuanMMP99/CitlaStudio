import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitanosUser } from './visitanos-user';

describe('VisitanosUser', () => {
  let component: VisitanosUser;
  let fixture: ComponentFixture<VisitanosUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitanosUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitanosUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
