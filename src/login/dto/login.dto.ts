export class RegisterRequest {
    readonly email?: string;
    readonly password?: string;
}

export class UpdateProfileRequest {
    readonly signature?: string;
    readonly avatarUrl?: string;
    readonly nickName?: string;
}