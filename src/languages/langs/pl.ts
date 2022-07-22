export default {

    // -------------------

    translator: 'Mateusz#4711',
    version: '6.0.0',
    owner: 'Mateusz#4711',

    // -------------------

    /**
     * @name executeCommand
     */
    executeCommand: {

        noPermissinos: 'Brak uprawnień.',
        devCommand: 'To polecenie jest dla developera!',
        thisCommandRequirePermission: (perm: string) => { return `To polecenie wymaga uprawnień!\n\`${perm}\`` }

    },

    /**
     * @name Commands
     */
    commands: {

        /**
         * @command ping
         */
        ping: `Ping bota wynosi:`

    }

}