import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let testUsers = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User', role: 'admin' },
                         { id: 2, username: 'testMasuk', password: 'testMasuk', firstName: 'TestMasuk', lastName: 'UserMasuk', role: 'user'}
                        ];


        return of(null).pipe(mergeMap(() => {
            // console.log(request);
            let bodyTemp: any;
            // authenticate
            if (request.url.endsWith('/users/authenticate') && request.method === 'POST') {
                testUsers.forEach(testUser => {
                    if (request.body.username === testUser.username && request.body.password === testUser.password ) {
                        bodyTemp = {
                            id: testUser.id,
                            username: testUser.username,
                            password: testUser.password,
                            firstName: testUser.firstName,
                            lastName: testUser.lastName,
                            role: testUser.role,
                            token: 'fake-jwt-token'
                        }
                    }
                });
                // console.log(bodyTemp);
                if (request.body.username === bodyTemp.username && request.body.password === bodyTemp.password) {
                    let body = {
                        id: bodyTemp.id,
                        username: bodyTemp.username,
                        firstName: bodyTemp.firstName,
                        lastName: bodyTemp.lastName,
                        role: bodyTemp.role,
                        token: 'fake-jwt-token'
                    };
                    
                    return of(new HttpResponse({ status: 200, body }));
                } else {
                    return throwError({ error: { message: 'Username or password is incorrect' } });
                }
            }

            if (request.url.endsWith('/users') && request.method === 'GET') {
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: [testUsers] }));
                } else {
                    return throwError({ error: { message: 'Unauthorised' } });
                }
            }

            return next.handle(request);
            
        }))

        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize());
    }
}

export let fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};