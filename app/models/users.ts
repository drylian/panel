import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import ClientToken from "./cli-tokens";

/**
 * Entity of User.
 */
@Entity("Users")
export default class Users extends BaseEntity {
    /**
     * ID único do usuário.
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * Username of user.
     */
    @Column({ nullable: false, unique: true })
    username!: string;

    /**
     * Email of user.
     */
    @Column({ nullable: false, unique: true })
    email!: string;

    /**
     * Password of user
     */
    @Column({ type: "text", nullable: false })
    password!: string;

    /**
     * Permissions of user
     */
    @Column({ type: "simple-array", nullable: false, default: JSON.stringify([]) })
    permissions!: string[];

    /**
     * UUID of user
     * @type {string}
     */
    @Column({ nullable: false })
    uuid!: string;

    /**
     * Two factor of account
     * @type {string}
     */
    @Column({ nullable: true, default: undefined })
    two_factor?: string;

    /**
     * Suspended account.
     */
    @Column({
        type: "boolean",
        default: false,
    })
    suspended!: boolean;

    /**
    * Suspended reason of account.
    */
    @Column({
        nullable: true
    })
    suspended_reason!: string;

    /**
     * Client tokens
     */
    @OneToMany(() => ClientToken, (token) => token.user, {
        onDelete: "CASCADE",
    })
    cli_tokens!: ClientToken[];

    /**
     * Latest update account.
     * @type {Date}
     */
    @UpdateDateColumn()
    update_at!: Date;

    /**
     * Creation of account.
     * @type {Date}
     */
    @CreateDateColumn()
    create_at!: Date;

    /**
     * Allowed Searchable Fields
     */
    public static readonly searchable: (keyof typeof this.prototype)[] = [
        "id",
        "username",
        "email",
        "permissions",
        "suspended",
        "suspended_reason",
        "uuid",
        "create_at",
        "update_at",
    ];

    /**
     * Allowed another tables includes in this model
     */
    public static readonly includes: (keyof typeof this.prototype)[] = [];

    /**
     * Filter only public informations 
     */
    public static public(...datables: typeof this.prototype[]) {
        return datables.map((data: Partial<typeof this.prototype>) => {
            delete data.password;
            delete data.two_factor;
            return data as Omit<typeof data, "password" | "two_factor">;
        })
    }
}
