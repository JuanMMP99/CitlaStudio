import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosUser } from './servicios-user';

describe('ServiciosUser', () => {
  let component: ServiciosUser;
  let fixture: ComponentFixture<ServiciosUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
