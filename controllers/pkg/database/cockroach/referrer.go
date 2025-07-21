package cockroach

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
)

func GetReferrerUID(ctx context.Context, db *sql.DB, uid uuid.UUID) (uuid.UUID, error) {
	var referrerUID uuid.UUID
	query := `
        SELECT uid 
        FROM referral 
        WHERE id = (SELECT referrer_id FROM referral WHERE uid = $1)
    `
	err := db.QueryRowContext(ctx, query, uid).Scan(&referrerUID)
	if errors.Is(err, sql.ErrNoRows) {
		return uuid.Nil, nil // Return zero UUID if no referrer found
	}
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to query referrer UID: %w", err)
	}
	return referrerUID, nil
}
